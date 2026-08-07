"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { trpc } from "@/app/providers";
import styles from "./write.module.css";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function WritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") ?? "";
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [inputMode, setInputMode] = useState<"keyboard" | "pen" | "voice">("keyboard");
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
    setTimeout(() => router.push("/reflection/" + entry.id), 600);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.iconBtn} onClick={() => router.push("/home")} title="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <button className={styles.iconBtn} title="Brightness">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>
          <button className={styles.iconBtn} title="Share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
          <button className={styles.iconBtn} title="Bookmark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
        <span className={styles.wordCount}>{wordCount} words</span>
      </header>

 <main className={styles.main}>
  <div className={styles.linesWrapper}>
    <div className={styles.lines}>
      <span className={styles.line} style={{width: "15%"}}/>
      <span className={styles.line} style={{width: "28%"}}/>
      <span className={styles.line} style={{width: "40%"}}/>
      <span className={styles.line} style={{width: "52%"}}/>
      <span className={styles.line} style={{width: "63%"}}/>
      <span className={styles.line} style={{width: "73%"}}/>
      <span className={styles.line} style={{width: "82%"}}/>
      <span className={styles.line} style={{width: "90%"}}/>
    </div>
    <textarea
      ref={textareaRef}
      className={styles.textarea}
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="begin."
      spellCheck={false}
    />
  </div>
</main>

      <footer className={styles.footer}>
        <div className={styles.modeRow}>
          <button
            className={styles.modeBtn + (inputMode === "keyboard" ? " " + styles.modeActive : "")}
            onClick={() => setInputMode("keyboard")}
            title="Keyboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <line x1="6" y1="10" x2="6" y2="10"/>
              <line x1="10" y1="10" x2="10" y2="10"/>
              <line x1="14" y1="10" x2="14" y2="10"/>
              <line x1="18" y1="10" x2="18" y2="10"/>
              <line x1="6" y1="14" x2="18" y2="14"/>
            </svg>
          </button>
          <button
            className={styles.modeBtn + (inputMode === "pen" ? " " + styles.modeActive : "")}
            onClick={() => setInputMode("pen")}
            title="Pen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
              <circle cx="11" cy="11" r="2"/>
            </svg>
          </button>
          <button
            className={styles.modeBtn + (inputMode === "voice" ? " " + styles.modeActive : "")}
            onClick={() => setInputMode("voice")}
            title="Voice"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <motion.button
          className={styles.save}
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
export default function WritePageWrapper() {
  return (
    <Suspense fallback={<div />}>
      <WritePage />
    </Suspense>
  );
}
