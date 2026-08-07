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
  "What are you carrying that is not yours?",
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
        <div className={styles.logoGroup}>
          <span className={styles.logo}>kanso</span>
          <span className={styles.logoJp}>感想</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.themeToggle} onClick={toggle} title="Toggle theme">
            {theme === "light" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            )}
          </button>
          <button className={styles.headerBtn} onClick={() => router.push("/archive")}>library</button>
          <button className={styles.headerBtn} onClick={handleSignOut}>sign out</button>
        </div>
      </header>

      <main className={styles.main}>

        <section className={styles.section}>
          <p className={styles.sectionLabel}>last 7 days</p>
          <div className={styles.carousel}>
            <button
              className={styles.newCard}
              onClick={() => router.push("/write?prompt=" + encodeURIComponent(prompt ?? ""))}
            >
              <span className={styles.newCardIcon}>+</span>
              <span className={styles.newCardLabel}>new write-up</span>
            </button>
            {entries && entries.length > 0 ? entries.slice(0, 5).map(function(entry) {
              return (
                <div
                  key={entry.id}
                  className={styles.entryCard}
                  onClick={() => router.push("/reflection/" + entry.id)}
                >
                  <p className={styles.entryCardDate}>
                    {new Date(entry.createdAt!).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short",
                    })}
                  </p>
                  <p className={styles.entryCardText}>{entry.text.slice(0, 80)}</p>
                  <p className={styles.entryCardWords}>{entry.wordCount} words</p>
                </div>
              );
            }) : (
              <div className={styles.emptyCard}>
                <p className={styles.emptyCardText}>your recent writing will live here.</p>
              </div>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionLabel}>for you</p>
          <div className={styles.promptList}>
            {MORE_PROMPTS.map(function(p) {
              return (
                <button
                  key={p}
                  className={styles.promptChip}
                  onClick={() => router.push("/write?prompt=" + encodeURIComponent(p))}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </section>

       <section className={styles.section}>
  <p className={styles.sectionLabel}>whispers</p>
  <div className={styles.whispersTrack}>
    <div className={styles.whispersInner}>
      {[...WHISPERS, ...WHISPERS].map(function(w, i) {
        return (
          <div key={i} className={styles.whisperCard}>
            <p className={styles.whisperQuote}>{w.quote}</p>
            <p className={styles.whisperAuthor}>-- {w.author}</p>
          </div>
        );
      })}
    </div>
  </div>
</section>

      </main>

      <button
        className={styles.fab}
        onClick={() => router.push("/write?prompt=" + encodeURIComponent(prompt ?? ""))}
      >
        +
      </button>
    </div>
  );
}
