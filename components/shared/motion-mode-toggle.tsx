"use client";

import { useEffect, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";

type MotionMode = "calm" | "vivid";

const STORAGE_KEY = "simsekoglu-motion-mode";

function applyMotionMode(mode: MotionMode) {
  const root = document.documentElement;
  if (mode === "vivid") {
    root.classList.add("motion-vivid");
    return;
  }
  root.classList.remove("motion-vivid");
}

export function MotionModeToggle() {
  const { locale } = useSiteData();
  const [mode, setMode] = useState<MotionMode>("calm");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initialMode: MotionMode = saved === "vivid" ? "vivid" : "calm";
    setMode(initialMode);
    applyMotionMode(initialMode);
  }, []);

  const changeMode = (nextMode: MotionMode) => {
    setMode(nextMode);
    applyMotionMode(nextMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="uppercase tracking-[0.14em] text-white/60">
        {locale === "tr" ? "Animasyon" : "Animation"}
      </span>
      <div className="inline-flex rounded-full border border-white/20 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => changeMode("calm")}
          className={`premium-btn rounded-full px-3 py-1 font-semibold ${
            mode === "calm" ? "bg-gold-500 text-navy-900" : "text-white/75 hover:text-white"
          }`}
        >
          {locale === "tr" ? "Sakin" : "Calm"}
        </button>
        <button
          type="button"
          onClick={() => changeMode("vivid")}
          className={`premium-btn rounded-full px-3 py-1 font-semibold ${
            mode === "vivid" ? "bg-gold-500 text-navy-900" : "text-white/75 hover:text-white"
          }`}
        >
          {locale === "tr" ? "Canlı" : "Vivid"}
        </button>
      </div>
    </div>
  );
}

