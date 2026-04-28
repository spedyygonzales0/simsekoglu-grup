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
    <div className="inline-flex rounded-full border border-white/30 bg-white/10 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            locale === option.value
              ? "bg-gold-500 text-navy-900"
              : "text-white hover:bg-white/15"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
