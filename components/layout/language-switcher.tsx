"use client";

import { useSiteData } from "@/components/providers/site-data-provider";
import { Locale } from "@/lib/types";

export function LanguageSwitcher() {
  const { locale, setLocale } = useSiteData();

  const options: { label: string; value: Locale }[] = [
    { label: "TR", value: "tr" },
    { label: "EN", value: "en" }
  ];

  return (
    <div className="inline-flex rounded-full border border-white/35 bg-white/12 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
            locale === option.value
              ? "bg-gold-500 text-navy-900"
              : "text-white/95 hover:bg-white/18"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
