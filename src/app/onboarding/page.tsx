"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/app/providers";
import styles from "./onboarding.module.css";

const INTERESTS = [
  "Daily life", "Emotions", "Creativity", "Relationships",
  "Work", "Dreams", "Gratitude", "Growth", "Rest", "Ideas",
];

const STYLES = [
  "Stream of consciousness", "Structured", "Short and sharp",
  "Poetic", "Reflective", "Raw and unfiltered",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [styles_, setStyles] = useState<string[]>([]);
  const upsertProfile = trpc.profile.upsert.useMutation();

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  }

  async function finish() {
    await upsertProfile.mutateAsync({
      interests,
      styles: styles_,
      onboarded: true,
    });
    router.push("/home");
  }

  return (
    <div className={styles.page}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className={styles.heading}>What do you write about?</h2>
            <p className={styles.sub}>Choose as many as feel right.</p>
            <div className={styles.chips}>
              {INTERESTS.map(item => (
                <button
                  key={item}
                  className={`${styles.chip} ${interests.includes(item) ? styles.selected : ""}`}
                  onClick={() => toggleItem(interests, setInterests, item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <button className={styles.next} onClick={() => setStep(1)}>
              Continue
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className={styles.heading}>How do you write?</h2>
            <p className={styles.sub}>Pick what feels like you.</p>
            <div className={styles.chips}>
              {STYLES.map(item => (
                <button
                  key={item}
                  className={`${styles.chip} ${styles_.includes(item) ? styles.selected : ""}`}
                  onClick={() => toggleItem(styles_, setStyles, item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className={styles.row}>
              <button className={styles.back} onClick={() => setStep(0)}>Back</button>
              <button className={styles.next} onClick={finish} disabled={upsertProfile.isPending}>
                {upsertProfile.isPending ? "Saving..." : "Enter Kansō"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}