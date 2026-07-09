"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/app/providers";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const { data: profile } = trpc.profile.get.useQuery();
  const upsertProfile = trpc.profile.upsert.useMutation();

  useEffect(() => {
    if (profile?.theme) {
      setTheme(profile.theme as Theme);
      document.documentElement.setAttribute("data-theme", profile.theme);
    }
  }, [profile]);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    upsertProfile.mutate({ theme: next });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);