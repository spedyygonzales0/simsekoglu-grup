"use client";

import Link from "next/link";
import { useSiteData } from "@/components/providers/site-data-provider";

export function CtaBanner() {
  const { locale } = useSiteData();

  return (
    <section className="section-spacing">
      <div className="container-wide">
        <div className="premium-gradient relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="absolute -right-8 top-0 h-48 w-48 rounded-full bg-gold-500/20 blur-2xl" />
          <div className="absolute -bottom-10 left-0 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-2 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-300">
                {locale === "tr" ? "Hızlı Teklif" : "Fast Quote"}
              </p>
              <h3 className="font-display text-3xl font-semibold sm:text-4xl">
                {locale === "tr"
                  ? "Projeniz için güçlü bir iş ortağı arıyorsanız bizimle iletişime geçin."
                  : "Contact us if you need a strong partner for your next project."}
              </h3>
            </div>
            <Link
              href="/contact"
              className="self-start rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-navy-900 md:self-auto"
            >
              {locale === "tr" ? "İletişime Geç" : "Contact Us"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
