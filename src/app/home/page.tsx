"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { trpc } from "@/app/providers";
import { useSession, signOut } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme";
import { getRandomPrompt } from "@/lib/prompts";
import styles from "./home.module.css";

const MORE_PROMPTS = [
  "What are you not saying?",
  "What did today ask of you?",
  "What are you carrying that isn't yours?",
  "What would you tell yourself from a year ago?",
  "What are you pretending not to know?",
];

const WHISPERS = [
  { quote: "We are made of all those who have built and broken us.", author: "Atticus" },
  { quote: "Pay attention. Be astonished. Tell about it.", author: "Mary Oliver" },
  { quote: "You must write every single day of your life.", author: "Ray Bradbury" },
  { quote: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
];

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: entries } = trpc.entries.list.useQuery();
  const { theme, toggle } = useTheme();
  const [prompt, setPrompt] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(getRandomPrompt());
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>Kansō</span>
        <div className={styles.headerActions}>
          <button
            className={`${styles.themeToggle} glass-button`}
            onClick={toggle}
          >
            {theme === "light" ? "○" : "●"}
          </button>
          <button className={styles.archive} onClick={() => router.push("/archive")}>
            library
          </button>
          <button className={styles.signOut} onClick={handleSignOut}>
            sign out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.greeting}>{greeting}, {firstName}.</p>
          {prompt && <h2 className={styles.prompt}>{prompt}</h2>}
          <p className={styles.promptLabel}>today s prompt</p>
        </motion.div>

        {prompt && (
          <motion.button
            className={`${styles.writeButton} glass-button`}
            onClick={() => router.push(`/write?prompt=${encodeURIComponent(prompt)}`)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            open the page
          </motion.button>
        )}

        <motion.div
          className={styles.promptCarousel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className={styles.carouselLabel}>for you</p>
          <div className={styles.carouselTrack}>
            {MORE_PROMPTS.map((p) => (
              <button
                key={p}
                className={styles.carouselChip}
                onClick={() => router.push(`/write?prompt=${encodeURIComponent(p)}`)}
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.whispers}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className={styles.carouselLabel}>whispers</p>
          <div className={styles.whispersTrack}>
            {WHISPERS.map((w) => (
              <div key={w.author} className={styles.whisperCard}>
                <p className={styles.whisperQuote}>{w.quote}</p>
                <p className={styles.whisperAuthor}>-- {w.author}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {entries && entries.length > 0 && (
          <motion.div
            className={styles.recent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className={styles.recentLabel}>recent</p>
            {entries.slice(0, 3).map(entry => (
              <div
                key={entry.id}
                className={styles.entryRow}
                onClick={() => router.push(`/reflection/${entry.id}`)}
              >
                <p className={styles.entryText}>{entry.text.slice(0, 100)}...</p>
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
