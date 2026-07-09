"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import styles from "./sign-in.module.css";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      console.log("SIGN IN RESULT:", JSON.stringify(result));
      if (result.error) {
        setError(result.error.message ?? "Sign in failed.");
        setLoading(false);
        return;
      }
      router.push("/home");
    } catch (e) {
      console.error("SIGN IN EXCEPTION:", e);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Kansō</h1>
        <p className={styles.subtitle}>Welcome back.</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          className={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className={styles.footer}>
          No account?{" "}
          <Link href="/sign-up" className={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}