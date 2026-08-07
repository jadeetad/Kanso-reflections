"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { trpc } from "@/app/providers";
import styles from "./archive.module.css";

export default function LibraryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: entries, isLoading } = trpc.entries.list.useQuery();

  const filteredEntries = entries?.filter(function(e) {
    return e.text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => router.push("/home")}>
          home
        </button>
        <span className={styles.title}>library</span>
        <span style={{width: "60px"}}/>
      </header>

      <div className={styles.searchRow}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className={styles.search}
          placeholder="search"
          value={search}
          onChange={function(e) { setSearch(e.target.value); }}
        />
      </div>

      <main className={styles.main}>
        {isLoading && <p className={styles.empty}>loading...</p>}

        {!isLoading && (!filteredEntries || filteredEntries.length === 0) && (
          <p className={styles.empty}>nothing here yet. write something.</p>
        )}

        {filteredEntries?.map(function(entry, i) {
          return (
            <motion.div
              key={entry.id}
              className={styles.entry}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              onClick={() => router.push("/reflection/" + entry.id)}
            >
              <p className={styles.entryText}>{entry.text.slice(0, 140)}...</p>
              <div className={styles.entryMeta}>
                <span className={styles.entryWords}>{entry.wordCount} words</span>
                <span className={styles.entryDate}>
                  {new Date(entry.createdAt!).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </div>
            </motion.div>
          );
        })}
      </main>
    </div>
  );
}
