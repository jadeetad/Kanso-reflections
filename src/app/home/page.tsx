"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { trpc } from "@/app/providers";
import { useSession } from "@/lib/auth-client";
import { getRandomPrompt } from "@/lib/prompts";
import { useState } from "react";
import styles from "./home.module.css";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: entries } = trpc.entries.list.useQuery();
  const [prompt] = useState(getRandomPrompt);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>Kansō</span>
        <button
          className={styles.archive}
          onClick={() => router.push("/archive")}
        >
          Archive
        </button>
      </header>

      <main className={styles.main}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.greeting}>{greeting}, {firstName}.</p>
          <h2 className={styles.prompt}>{prompt}</h2>
        </motion.div>

        <motion.button
  className={styles.writeButton}
  onClick={() => router.push(`/write?prompt=${encodeURIComponent(prompt)}`)}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.3, duration: 0.6 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  Open the page
</motion.button>

        {entries && entries.length > 0 && (
          <motion.div
            className={styles.recent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <p className={styles.recentLabel}>Recent</p>
            {entries.slice(0, 3).map(entry => (
              <div key={entry.id} className={styles.entryRow}>
                <p className={styles.entryText}>{entry.text.slice(0, 80)}...</p>
                <p className={styles.entryDate}>
                  {new Date(entry.createdAt!).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short",
                  })}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}