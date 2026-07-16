"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { trpc } from "@/app/providers";
import styles from "./write.module.css";

type InputMode = "keyboard" | "pen" | "voice";

export default function WritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") ?? "";
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("keyboard");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTime = useRef(Date.now());
  const createEntry = trpc.entries.create.useMutation();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  async function handleSave() {
    if (text.trim().length < 10) return;
    const entry = await createEntry.mutateAsync({
      text,
      wordCount,
      lineCount: text.split("\n").length,
      durationMs: Date.now() - startTime.current,
      inputMode,
      prompt: prompt || undefined,
    });
    setSaved(true);
    setTimeout(() => router.push(`/reflection/${entry.id}`), 600);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => router.push("/home")}>
          back
        </button>
        {prompt && <p className={styles.prompt}>{prompt}</p>}
        <span className={styles.wordCount}>{wordCount} words</span>
      </header>

      <main className={styles.main}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Begin anywhere."
          spellCheck={false}
        />
      </main>

      <footer className={styles.footer}>
        <div className={styles.modeRow}>
          <button
            className={`${styles.modeBtn} ${inputMode === "keyboard" ? styles.modeActive : ""}`}
            onClick={() => setInputMode("keyboard")}
            title="Keyboard"
          >
            kb
          </button>
          <button
            className={`${styles.modeBtn} ${inputMode === "pen" ? styles.modeActive : ""}`}
            onClick={() => setInputMode("pen")}
            title="Pen"
          >
            pen
          </button>
          <button
            className={`${styles.modeBtn} ${inputMode === "voice" ? styles.modeActive : ""}`}
            onClick={() => setInputMode("voice")}
            title="Voice"
          >
            voice
          </button>
        </div>
        <motion.button
          className={`${styles.save} glass-button`}
          onClick={handleSave}
          disabled={text.trim().length < 10 || createEntry.isPending || saved}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saved ? "saved" : createEntry.isPending ? "saving..." : "end session"}
        </motion.button>
      </footer>
    </div>
  );
}
