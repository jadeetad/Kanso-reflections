"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { trpc } from "@/app/providers";
import styles from "./reflection.module.css";

export default function ReflectionPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [responded, setResponded] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [editText, setEditText] = useState(null);

  const { data: entries } = trpc.entries.list.useQuery();
  const currentEntry = entries?.find(function(e) { return e.id === id; });

  const { data: reflections, refetch } = trpc.reflections.getByEntry.useQuery(
    { entryId: id },
    { enabled: !!id }
  );

  const respondToReflection = trpc.reflections.respond.useMutation();
  const createEntry = trpc.entries.create.useMutation({
    onSuccess: function(entry) {
      router.push("/reflection/" + entry.id);
    }
  });

  const reflection = reflections?.[0];
  const displayText = streamedText || reflection?.text || "";

  function handleEntryClick() {
    if (editText === null) {
      setEditText(currentEntry?.text ?? "");
    }
  }

  async function handleReflect() {
    const textToUse = editText !== null ? editText : currentEntry?.text;
    if (!textToUse) return;

    if (editText !== null && editText !== currentEntry?.text) {
      const wordCount = editText.trim().split(/\s+/).length;
      await createEntry.mutateAsync({
        text: editText,
        wordCount,
        lineCount: editText.split("\n").length,
        durationMs: 0,
      });
      return;
    }

    setStreaming(true);
    setStreamedText("");
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: id, entryText: textToUse }),
      });
      if (!res.ok) {
        const text = await res.text();
        setStreamedText(text === "Rate limit exceeded"
          ? "You have reached your daily reflection limit. Come back tomorrow."
          : "Something went wrong. Please try again.");
        setStreaming(false);
        return;
      }
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }
      setStreamedText(fullText);
      refetch();
    } catch (e) {
      console.error(e);
      setStreamedText("Something went wrong. Please try again.");
    } finally {
      setStreaming(false);
    }
  }

  async function handleRespond(response) {
    if (!reflection) return;
    await respondToReflection.mutateAsync({ id: reflection.id, response });
    setResponded(true);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => router.push("/home")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          home
        </button>
      </header>

      <main className={styles.main}>
        {currentEntry && (
          <motion.div
            className={styles.entry}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            onClick={handleEntryClick}
            title="click to edit"
          >
            {editText !== null ? (
              <textarea
                className={styles.inlineEdit}
                value={editText}
                onChange={function(e) { setEditText(e.target.value); }}
                autoFocus
                onClick={function(e) { e.stopPropagation(); }}
              />
            ) : (
              <p className={styles.entryText}>{currentEntry.text}</p>
            )}
            {editText === null && (
              <span className={styles.editHint}>click to edit</span>
            )}
          </motion.div>
        )}

        <div className={styles.divider} />

        <motion.button
          className={styles.reflectButton}
          onClick={handleReflect}
          disabled={streaming || createEntry.isPending}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {createEntry.isPending ? "saving..." : streaming ? "reflecting..." : editText !== null && editText !== currentEntry?.text ? "save and re-reflect" : "request a reflection"}
        </motion.button>

        {streaming && !streamedText && (
          <motion.p
            className={styles.thinking}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            sitting with your words...
          </motion.p>
        )}

        {displayText && (
          <motion.div
            className={styles.reflectionBlock}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.reflectionText}>
              <ReactMarkdown
                components={{
                  strong: function({ children }) {
                    return <span className={styles.sectionHeading}>{children}</span>;
                  },
                  p: function({ children }) {
                    return <p className={styles.sectionBody}>{children}</p>;
                  },
                }}
              >
                {displayText}
              </ReactMarkdown>
            </div>

            {!streaming && !responded && !reflection?.reviewed && reflection && (
              <div className={styles.responseRow}>
                <button className={styles.resonates} onClick={() => handleRespond("resonates")}>
                  this resonates
                </button>
                <button className={styles.missed} onClick={() => handleRespond("missed")}>
                  missed the mark
                </button>
              </div>
            )}

            {(responded || reflection?.reviewed) && (
              <p className={styles.thanks}>thank you for the feedback.</p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}