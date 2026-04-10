import { useState, useEffect } from "react";
import { loadTheme, saveTheme } from "@/lib/storage";

export function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark">(loadTheme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  function setTheme(newTheme: "light" | "dark") {
    saveTheme(newTheme);
    setThemeState(newTheme);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return { theme, setTheme, toggleTheme };
}
