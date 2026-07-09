"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { trpc } from "@/app/providers";
import styles from "./archive.module.css";

export default function ArchivePage() {
  const router = useRouter();
  const { data: entries, isLoading } = trpc.entries.list.useQuery();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => router.push("/home")}>
          ← Home
        </button>
        <span className={styles.title}>Archive</span>
      </header>

      <main className={styles.main}>
        {isLoading && <p className={styles.empty}>Loading...</p>}

        {!isLoading && (!entries || entries.length === 0) && (
          <p className={styles.empty}>Nothing here yet.</p>
        )}

        {entries?.map((entry, i) => (
          <motion.div
            key={entry.id}
            className={styles.entry}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            onClick={() => router.push(`/reflection/${entry.id}`)}
          >
            <p className={styles.entryText}>{entry.text.slice(0, 120)}...</p>
            <div className={styles.meta}>
              <span className={styles.words}>{entry.wordCount} words</span>
              <span className={styles.date}>
                {new Date(entry.createdAt!).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
          </motion.div>
        ))}
      </main>
    </div>
  );
}