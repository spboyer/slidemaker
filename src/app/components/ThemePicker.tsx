"use client";

import { REVEAL_THEMES, RevealTheme } from "@/lib/reveal-themes";

interface ThemePickerProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export default function ThemePicker({
  currentTheme,
  onThemeChange,
}: ThemePickerProps) {
  return (
    <div className="relative">
      <details className="group">
        <summary className="flex cursor-pointer items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 list-none">
          <span
            className="inline-block h-3 w-3 rounded-full border border-white/30"
            style={{
              backgroundColor:
                REVEAL_THEMES.find((t) => t.id === currentTheme)
                  ?.previewBackground ?? "#111",
            }}
          />
          Theme
        </summary>
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-white/10 bg-gray-900 p-2 shadow-xl">
          <div className="grid grid-cols-3 gap-1.5">
            {REVEAL_THEMES.map((theme: RevealTheme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  // Close the details dropdown
                  const details = document.querySelector(
                    "details.group[open]"
                  ) as HTMLDetailsElement | null;
                  if (details) details.open = false;
                }}
                className={`flex flex-col items-center gap-1 rounded-md p-1.5 text-[10px] transition-colors ${
                  currentTheme === theme.id
                    ? "bg-indigo-600/30 ring-1 ring-indigo-500"
                    : "hover:bg-white/10"
                }`}
                title={theme.name}
              >
                <div
                  className="h-6 w-full rounded border border-white/10"
                  style={{
                    backgroundColor: theme.previewBackground,
                    color: theme.previewTextColor,
                  }}
                >
                  <span
                    className="flex h-full items-center justify-center text-[8px] font-bold"
                    style={{ color: theme.previewTextColor }}
                  >
                    Aa
                  </span>
                </div>
                <span className="text-white/70">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
