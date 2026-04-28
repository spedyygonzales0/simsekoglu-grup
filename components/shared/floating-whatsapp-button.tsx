"use client";

import { useMemo } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { buildWhatsAppUrl } from "@/lib/data/whatsapp";

export function FloatingWhatsAppButton() {
  const { locale, content } = useSiteData();

  const href = useMemo(() => {
    const message =
      locale === "tr"
        ? "Merhaba, Şimşekoğlu Grup web sitesinden bilgi almak istiyorum."
        : "Hello, I would like to get information from Simsekoglu Group website.";
    return buildWhatsAppUrl(content.contact.whatsapp, message);
  }, [content.contact.whatsapp, locale]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={locale === "tr" ? "WhatsApp ile iletişime geç" : "Contact on WhatsApp"}
      className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_-12px_rgba(7,20,39,0.65)] transition-transform duration-200 hover:scale-105 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:h-12 sm:w-12"
      style={{
        right: "calc(1rem + env(safe-area-inset-right))",
        bottom: "calc(1rem + env(safe-area-inset-bottom))"
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-7 w-7 sm:h-6 sm:w-6"
        aria-hidden="true"
      >
        <path
          d="M12 4a8 8 0 0 0-6.86 12.1L4 20l3.98-1.08A8 8 0 1 0 12 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 8.8c.15-.35.3-.38.57-.39.24-.01.52-.01.79 0 .2 0 .46.07.7.35.24.27.9.88.97 2.13.07 1.25-.72 2.52-1.45 3.22-.72.7-1.52 1.11-2.6.7-1.08-.42-2.03-1.24-2.64-2.3-.6-1.05-.6-1.68-.44-2.1.13-.34.35-.63.55-.85.2-.22.3-.26.45-.26h.57c.17 0 .37.03.55.4.19.38.64 1.31.7 1.4.06.08.1.19.03.31-.07.11-.1.19-.2.29-.1.1-.21.22-.3.3-.1.1-.2.2-.08.4.12.2.53.87 1.14 1.41.78.7 1.44.93 1.64 1.03.2.1.31.08.42-.05.1-.12.45-.53.58-.72.12-.2.25-.17.42-.1.17.06 1.08.5 1.26.59.19.1.31.14.36.22.05.08.05.48-.1.94"
          fill="currentColor"
        />
      </svg>
    </a>
  );
}

