"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./page.module.css";

export default function SplashPage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <h1 className={styles.title}>Kansō</h1>
        <p className={styles.tagline}>Reflections</p>
        <div className={styles.actions}>
          <button
            className={styles.primary}
            onClick={() => router.push("/sign-up")}
          >
            Begin
          </button>
          <button
            className={styles.secondary}
            onClick={() => router.push("/sign-in")}
          >
            Sign in
          </button>
        </div>
      </motion.div>
    </div>
  );
}