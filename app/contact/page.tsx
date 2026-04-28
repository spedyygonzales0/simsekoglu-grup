"use client";

import { FormEvent, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { buildQuoteMessage, buildWhatsAppUrl } from "@/lib/data/whatsapp";
import { t } from "@/lib/i18n";
import { PageHero } from "@/components/shared/page-hero";
import { QuoteButton } from "@/components/shared/quote-button";
import { SectionTitle } from "@/components/shared/section-title";
import { ServiceType } from "@/lib/types";

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

  const whatsappLink = buildWhatsAppUrl(
    content.contact.whatsapp,
    buildQuoteMessage({
      locale,
      serviceType: "construction",
      selectedLabel: locale === "tr" ? "Genel Hizmet Talebi" : "General Service Request"
    })
  );
  const instagramValue = content.contact.social.instagram || "@simsekoglufilo";
  const instagramUrl = instagramValue.startsWith("http")
    ? instagramValue
    : `https://instagram.com/${instagramValue.replace(/^@/, "")}`;

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
          <div className="glass-card space-y-5 p-6">
            <SectionTitle title={t(locale, "contact")} />
            <div className="space-y-3 text-sm text-navy-900/75">
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
              <div className="flex flex-wrap gap-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  className="inline-flex rounded-full bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-500"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  className="inline-flex rounded-full border border-navy-900/20 px-4 py-2 font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-500"
                  rel="noreferrer"
                >
                  Instagram ({instagramValue})
                </a>
              </div>
              <QuoteButton
                className="mt-1"
                serviceType="construction"
                selectedLabel={locale === "tr" ? "İletişim Sayfası Teklif Talebi" : "Contact Page Quote Request"}
              />
            </div>
            <div className="rounded-xl border border-dashed border-navy-900/20 p-4 text-sm text-navy-900/60">
              {/* Replace with real map embed */}
              <p className="font-semibold">{t(locale, "map")} Placeholder</p>
              <p>{content.contact.mapEmbedUrl}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <form onSubmit={handleContactSubmit} className="glass-card space-y-4 p-6">
              <h2 className="font-display text-2xl text-navy-900">{t(locale, "contactForm")}</h2>
              <input
                required
                placeholder={locale === "tr" ? "Ad Soyad" : "Full Name"}
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3"
              />
              <input
                required
                type="email"
                placeholder={locale === "tr" ? "E-posta" : "Email"}
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3"
              />
              <textarea
                required
                rows={5}
                placeholder={locale === "tr" ? "Mesajınız" : "Your Message"}
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3"
              />
              <button
                type="submit"
                className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                {t(locale, "send")}
              </button>
              {contactMessage ? <p className="text-sm text-green-700">{contactMessage}</p> : null}
            </form>

            <form onSubmit={handleQuoteSubmit} className="glass-card space-y-4 p-6">
              <h2 className="font-display text-2xl text-navy-900">{t(locale, "requestForm")}</h2>
              <input
                required
                value={quoteName}
                onChange={(event) => setQuoteName(event.target.value)}
                placeholder={locale === "tr" ? "Ad Soyad" : "Full Name"}
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3"
              />
              <input
                required
                value={quotePhone}
                onChange={(event) => setQuotePhone(event.target.value)}
                placeholder={locale === "tr" ? "Telefon" : "Phone"}
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3"
              />
              <input
                required
                type="email"
                value={quoteEmail}
                onChange={(event) => setQuoteEmail(event.target.value)}
                placeholder={locale === "tr" ? "E-posta" : "Email"}
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3"
              />
              <select
                value={quoteService}
                onChange={(event) => setQuoteService(event.target.value as ServiceType)}
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3"
              >
                <option value="construction">{locale === "tr" ? "İnşaat" : "Construction"}</option>
                <option value="architecture">{locale === "tr" ? "Mimarlık" : "Architecture"}</option>
                <option value="fleet">{locale === "tr" ? "Araç Kiralama" : "Fleet Rental"}</option>
              </select>
              <input
                value={quoteSelection}
                onChange={(event) => setQuoteSelection(event.target.value)}
                placeholder={
                  locale === "tr" ? "Seçilen araç/proje (opsiyonel)" : "Selected vehicle/project (optional)"
                }
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3"
              />
              <textarea
                required
                rows={4}
                value={quoteDetail}
                onChange={(event) => setQuoteDetail(event.target.value)}
                placeholder={locale === "tr" ? "Talep Detayı" : "Request Details"}
                className="w-full rounded-lg border border-navy-900/20 bg-white px-4 py-3"
              />
              <button
                type="submit"
                className="rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-400"
              >
                {locale === "tr" ? "Form Teklifi Gönder" : "Submit Form Quote"}
              </button>
              {quoteMessage ? <p className="text-sm text-green-700">{quoteMessage}</p> : null}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
