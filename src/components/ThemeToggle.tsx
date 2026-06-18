"use client";
import { useEffect, useState } from "react";

const OPTIONS = ["system", "light", "dark"] as const;
type Theme = (typeof OPTIONS)[number];

function apply(t: Theme) {
  const dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => setTheme((localStorage.getItem("theme") as Theme) || "system"), []);

  const choose = (t: Theme) => {
    localStorage.setItem("theme", t);
    setTheme(t);
    apply(t);
  };

  return (
    <div className="inline-flex p-0.5 rounded-lg bg-border-soft border border-border">
      {OPTIONS.map((t) => (
        <button
          key={t}
          onClick={() => choose(t)}
          className={
            "h-8 px-3 rounded-md text-sm font-medium capitalize " +
            (theme === t ? "bg-surface text-ink shadow-sm" : "text-ink-soft hover:text-ink")
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}
