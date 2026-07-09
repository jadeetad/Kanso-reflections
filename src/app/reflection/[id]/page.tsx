"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { trpc } from "@/app/providers";
import styles from "./reflection.module.css";

export default function ReflectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [responded, setResponded] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");

  const { data: entries } = trpc.entries.list.useQuery();
  const currentEntry = entries?.find(e => e.id === id);

  const { data: reflections, refetch } = trpc.reflections.getByEntry.useQuery(
    { entryId: id },
    { enabled: !!id }
  );

  const respondToReflection = trpc.reflections.respond.useMutation();
  const reflection = reflections?.[0];

  async function handleGenerate() {
  if (!currentEntry) return;
  setStreaming(true);
  setStreamedText("");

  try {
    const res = await fetch("/api/reflect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId: id, entryText: currentEntry.text }),
    });

    if (!res.ok) {
      const text = await res.text();
      setStreamedText(text === "Rate limit exceeded"
        ? "You've reached your daily reflection limit. Come back tomorrow."
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

  async function handleRespond(response: "resonates" | "missed") {
    if (!reflection) return;
    await respondToReflection.mutateAsync({ id: reflection.id, response });
    setResponded(true);
  }

  const displayText = streamedText || reflection?.text || "";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => router.push("/home")}>
          ← Home
        </button>
      </header>

      <main className={styles.main}>
        {currentEntry && (
          <motion.div
            className={styles.entry}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className={styles.entryText}>{currentEntry.text}</p>
          </motion.div>
        )}

        <div className={styles.divider} />

        {!displayText && !streaming && (
          <motion.button
            className={styles.reflectButton}
            onClick={handleGenerate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Request a reflection
          </motion.button>
        )}

        {streaming && !streamedText && (
          <motion.p
            className={styles.thinking}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Sitting with your words...
          </motion.p>
        )}

        {displayText && (
          <motion.div
            className={styles.reflectionBlock}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className={styles.reflectionText}>{displayText}</p>

            {!streaming && !responded && !reflection?.reviewed && reflection && (
              <div className={styles.responseRow}>
                <button
                  className={styles.resonates}
                  onClick={() => handleRespond("resonates")}
                >
                  This resonates
                </button>
                <button
                  className={styles.missed}
                  onClick={() => handleRespond("missed")}
                >
                  Missed the mark
                </button>
              </div>
            )}

            {(responded || reflection?.reviewed) && (
              <p className={styles.thanks}>Thank you for the feedback.</p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}