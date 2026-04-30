"use client";

import Link from "next/link";
import { useSiteData } from "@/components/providers/site-data-provider";
import { MotionModeToggle } from "@/components/shared/motion-mode-toggle";
import { buildWhatsAppUrl, getWhatsappNumberByChannel } from "@/lib/data/whatsapp";
import { t } from "@/lib/i18n";

const DEFAULT_MAP_LINK = "https://maps.app.goo.gl/TdHCzQVZe4N8qLrV9";

function normalizeMapsLink(rawLink: string | undefined): string {
  const value = (rawLink || "").trim();
  if (!value) return DEFAULT_MAP_LINK;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/+/, "")}`;
  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.toLowerCase();
    const isGoogleHost =
      host.includes("google.com") || host.includes("maps.app.goo.gl") || host.includes("goo.gl");
    return isGoogleHost ? withProtocol : DEFAULT_MAP_LINK;
  } catch {
    return DEFAULT_MAP_LINK;
  }
}

export function Footer() {
  const { locale, content } = useSiteData();
  const instagramHandle = content.contact.social.instagram?.trim() || "@simsekoglufilo";
  const instagramUrl = instagramHandle.startsWith("http")
    ? instagramHandle
    : `https://instagram.com/${instagramHandle.replace(/^@/, "")}`;

  const mapsLink = normalizeMapsLink(content.contact.mapLinkUrl || content.contact.mapEmbedUrl);
  const generalWhatsapp = getWhatsappNumberByChannel(content.contact, "general");

  return (
    <footer className="mt-16 border-t border-navy-900/20 bg-navy-900 text-white">
      <div className="container-wide py-14">
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
          <section className="space-y-3">
            <p className="text-base font-semibold tracking-[0.06em] text-gold-300">Şimşekoğlu Grup</p>
            <h3 className="section-title text-white">
              {locale === "tr" ? "Kurumsal Güç, Sürdürülebilir Çözüm" : "Corporate Power, Sustainable Solutions"}
            </h3>
            <p className="body-text text-white/85">
              {locale === "tr"
                ? "İnşaat, mimarlık ve filo alanlarında uzun vadeli iş ortaklıkları için planlı ve güvenilir hizmet sunuyoruz."
                : "We deliver planned and reliable services in construction, architecture, and fleet solutions for long-term partnerships."}
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-base font-semibold tracking-[0.06em] text-gold-300">
              {locale === "tr" ? "İletişim Bilgileri" : "Contact Information"}
            </h4>
            <p className="body-text text-white/92">{content.contact.phone}</p>
            <p className="body-text text-white/92">{content.contact.email}</p>
            <p className="body-text text-white/80">
              {locale === "tr" ? content.contact.addressTr : content.contact.addressEn}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className="premium-btn inline-flex rounded-full border border-gold-500/40 px-4 py-2 text-base font-semibold text-gold-300 hover:border-gold-300 hover:text-gold-200"
                href={buildWhatsAppUrl(
                  generalWhatsapp,
                  locale === "tr" ? "Merhaba, bilgi almak istiyorum." : "Hello, I would like to get information."
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              {mapsLink ? (
                <a
                  className="premium-btn inline-flex rounded-full border border-white/25 px-4 py-2 text-base font-semibold text-white/85 hover:border-gold-300 hover:text-gold-200"
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {locale === "tr" ? "Haritada Aç" : "Open Map"}
                </a>
              ) : null}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-base font-semibold tracking-[0.06em] text-gold-300">
              {locale === "tr" ? "Menü" : "Menu"}
            </h4>
            <div className="grid gap-2 text-base">
              <Link className="premium-btn text-white/80 hover:text-gold-300" href="/">
                {t(locale, "home")}
              </Link>
              <Link className="premium-btn text-white/80 hover:text-gold-300" href="/about">
                {t(locale, "about")}
              </Link>
              <Link className="premium-btn text-white/80 hover:text-gold-300" href="/construction">
                {t(locale, "construction")}
              </Link>
              <Link className="premium-btn text-white/80 hover:text-gold-300" href="/architecture">
                {t(locale, "architecture")}
              </Link>
              <Link className="premium-btn text-white/80 hover:text-gold-300" href="/fleet-rental">
                {t(locale, "fleet")}
              </Link>
              <Link className="premium-btn text-white/80 hover:text-gold-300" href="/contact">
                {t(locale, "contact")}
              </Link>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-base font-semibold tracking-[0.06em] text-gold-300">Instagram</h4>
            <p className="body-text text-white/80">
              {locale === "tr"
                ? "Güncel proje ve filo içeriklerimizi Instagram hesabımızdan takip edebilirsiniz."
                : "Follow our latest project and fleet content on Instagram."}
            </p>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn inline-flex rounded-full border border-gold-500/40 px-4 py-2 text-base font-semibold text-gold-300 hover:border-gold-300 hover:text-gold-200"
            >
              {instagramHandle}
            </a>
          </section>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base text-white/70">
              © {new Date().getFullYear()} Şimşekoğlu Grup. {locale === "tr" ? "Tüm hakları saklıdır." : "All rights reserved."}
            </p>
            <MotionModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
