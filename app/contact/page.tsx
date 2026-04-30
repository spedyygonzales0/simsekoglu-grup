"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { buildQuoteMessage, buildWhatsAppUrl, getWhatsappNumberByChannel } from "@/lib/data/whatsapp";
import { t } from "@/lib/i18n";
import { PageHero } from "@/components/shared/page-hero";
import { SectionTitle } from "@/components/shared/section-title";
import { ServiceType } from "@/lib/types";

const DEFAULT_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1291.7876590941064!2d32.610087211323965!3d40.066781855509205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d3338ec7768c3f%3A0xa6b18625d699dbd8!2zxZ7EsE3FnkVLT8SeTFUgT1RPTU9UxLBWIEbEsExP!5e1!3m2!1str!2str!4v1777455274447!5m2!1str!2str";
const DEFAULT_MAP_LINK = "https://maps.app.goo.gl/TdHCzQVZe4N8qLrV9";

function isEmbeddableGoogleMap(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("google.") && parsed.pathname.includes("/maps/embed");
  } catch {
    return false;
  }
}

function toAbsoluteExternalUrl(url: string, fallback: string): string {
  const value = (url || "").trim();
  if (!value) return fallback;

  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : /^www\./i.test(value) || /^[a-z0-9.-]+\.[a-z]{2,}\/?/i.test(value)
      ? `https://${value}`
      : "";
  if (!withProtocol) return fallback;

  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.toLowerCase();
    const isGoogleHost =
      host.includes("google.com") || host.includes("maps.app.goo.gl") || host.includes("goo.gl");
    return isGoogleHost ? withProtocol : fallback;
  } catch {
    return fallback;
  }
}

export default function ContactPage() {
  const { locale, content, createQuoteRequest } = useSiteData();

  const [contactMessage, setContactMessage] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");

  const [quoteName, setQuoteName] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quoteService, setQuoteService] = useState<ServiceType>("construction");
  const [quoteSelection, setQuoteSelection] = useState("");
  const [quoteDetail, setQuoteDetail] = useState("");

  const generalWhatsappLink = useMemo(() => {
    const number = getWhatsappNumberByChannel(content.contact, "general");
    const message = buildQuoteMessage({
      locale,
      serviceType: "construction",
      selectedLabel: locale === "tr" ? "Genel Hizmet Talebi" : "General Service Request"
    });
    return buildWhatsAppUrl(number, message);
  }, [content.contact, locale]);

  const instagramValue = content.contact.social.instagram || "@simsekoglufilo";
  const instagramUrl = instagramValue.startsWith("http")
    ? instagramValue
    : `https://instagram.com/${instagramValue.replace(/^@/, "")}`;

  const rawEmbed = content.contact.mapEmbedUrl?.trim() || "";
  const mapsEmbedUrl = isEmbeddableGoogleMap(rawEmbed) ? rawEmbed : DEFAULT_MAP_EMBED_URL;
  const mapsLink = toAbsoluteExternalUrl(content.contact.mapLinkUrl || "", DEFAULT_MAP_LINK);

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactMessage(
      locale === "tr"
        ? "Mesajınız alındı. En kısa sürede dönüş yapacağız."
        : "Your message has been received. We will get back to you shortly."
    );
  };

  const handleQuoteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = createQuoteRequest({
      name: quoteName,
      phone: quotePhone,
      email: quoteEmail,
      serviceType: quoteService,
      selectedVehicleLabel: quoteService === "fleet" ? quoteSelection : undefined,
      selectedProjectLabel: quoteService !== "fleet" ? quoteSelection : undefined,
      message: quoteDetail
    });

    setQuoteMessage(result.message);
    if (result.ok) {
      setQuoteName("");
      setQuotePhone("");
      setQuoteEmail("");
      setQuoteSelection("");
      setQuoteDetail("");
      setQuoteService("construction");
    }
  };

  return (
    <>
      <PageHero
        eyebrow={t(locale, "contact")}
        title={
          locale === "tr"
            ? "Projeniz ve Filo İhtiyaçlarınız İçin Bizimle İletişime Geçin"
            : "Get in Touch for Your Project and Fleet Requirements"
        }
        description={
          locale === "tr"
            ? "Uzman ekibimiz inşaat, mimarlık ve araç kiralama konularında hızlı geri dönüş sağlar."
            : "Our team provides fast responses for construction, architecture, and fleet rental requests."
        }
      />

      <section className="section-spacing">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="glass-card space-y-6 p-7">
            <SectionTitle title={t(locale, "contact")} />
            <div className="space-y-3 body-text text-navy-900/85">
              <p>
                <strong>{t(locale, "phone")}:</strong> {content.contact.phone}
              </p>
              <p>
                <strong>{t(locale, "email")}:</strong> {content.contact.email}
              </p>
              <p>
                <strong>{t(locale, "address")}:</strong>{" "}
                {locale === "tr" ? content.contact.addressTr : content.contact.addressEn}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={generalWhatsappLink}
                  target="_blank"
                  className="inline-flex rounded-full bg-green-600 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-green-500"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  className="inline-flex rounded-full border border-navy-900/20 px-5 py-2.5 text-base font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-500"
                  rel="noopener noreferrer"
                >
                  Instagram ({instagramValue})
                </a>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-navy-900/12 bg-white p-4 shadow-soft">
              {mapsEmbedUrl ? (
                <div className="relative h-[300px] overflow-hidden rounded-xl border border-navy-900/10 md:h-[420px]">
                  <iframe
                    src={mapsEmbedUrl}
                    title={locale === "tr" ? "Google Harita" : "Google Map"}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full"
                  />
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={locale === "tr" ? "Yol tarifi için haritayı aç" : "Open map for directions"}
                    onClick={(event) => {
                      event.preventDefault();
                      window.open(mapsLink, "_blank", "noopener,noreferrer");
                    }}
                    className="absolute inset-0 z-10 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-navy-900/20 p-4 text-base text-navy-900/70">
                  {locale === "tr" ? "Harita bağlantısı henüz eklenmedi." : "Map link is not added yet."}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <form onSubmit={handleContactSubmit} className="glass-card space-y-4 p-7">
              <h2 className="font-display text-3xl text-navy-900">{t(locale, "contactForm")}</h2>
              <input
                required
                placeholder={locale === "tr" ? "Ad Soyad" : "Full Name"}
                className="admin-input"
              />
              <input required type="email" placeholder={locale === "tr" ? "E-posta" : "Email"} className="admin-input" />
              <textarea
                required
                rows={5}
                placeholder={locale === "tr" ? "Mesajınız" : "Your Message"}
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3 text-base leading-7"
              />
              <button
                type="submit"
                className="rounded-full bg-navy-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-navy-700"
              >
                {t(locale, "send")}
              </button>
              {contactMessage ? <p className="text-base text-green-700">{contactMessage}</p> : null}
            </form>

            <form onSubmit={handleQuoteSubmit} className="glass-card space-y-4 p-7">
              <h2 className="font-display text-3xl text-navy-900">{t(locale, "requestForm")}</h2>
              <input required value={quoteName} onChange={(event) => setQuoteName(event.target.value)} placeholder={locale === "tr" ? "Ad Soyad" : "Full Name"} className="admin-input" />
              <input required value={quotePhone} onChange={(event) => setQuotePhone(event.target.value)} placeholder={locale === "tr" ? "Telefon" : "Phone"} className="admin-input" />
              <input required type="email" value={quoteEmail} onChange={(event) => setQuoteEmail(event.target.value)} placeholder={locale === "tr" ? "E-posta" : "Email"} className="admin-input" />
              <select value={quoteService} onChange={(event) => setQuoteService(event.target.value as ServiceType)} className="admin-input">
                <option value="construction">{locale === "tr" ? "İnşaat" : "Construction"}</option>
                <option value="architecture">{locale === "tr" ? "Mimarlık" : "Architecture"}</option>
                <option value="fleet">{locale === "tr" ? "Araç Kiralama" : "Fleet Rental"}</option>
              </select>
              <input
                value={quoteSelection}
                onChange={(event) => setQuoteSelection(event.target.value)}
                placeholder={locale === "tr" ? "Seçilen araç/proje (opsiyonel)" : "Selected vehicle/project (optional)"}
                className="admin-input"
              />
              <textarea
                required
                rows={4}
                value={quoteDetail}
                onChange={(event) => setQuoteDetail(event.target.value)}
                placeholder={locale === "tr" ? "Talep Detayı" : "Request Details"}
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3 text-base leading-7"
              />
              <button type="submit" className="rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-navy-900 transition hover:bg-gold-400">
                {locale === "tr" ? "Form Teklifi Gönder" : "Submit Form Quote"}
              </button>
              {quoteMessage ? <p className="text-base text-green-700">{quoteMessage}</p> : null}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
