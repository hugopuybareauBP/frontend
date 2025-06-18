// src/components/ThemeToggle.tsx

import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { dark, setDark } = useTheme();

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={() => setDark((v) => !v)}
      className="fixed top-6 right-6 z-50 w-12 h-12 rounded-xl flex items-center justify-center 
                 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 
                 shadow transition hover:scale-105 text-2xl"
    >
      {dark ? (
        <span role="img" aria-label="moon">🌙</span>
      ) : (
        <span role="img" aria-label="sun">☀️</span>
      )}
    </button>
  );
};

export default ThemeToggle;
