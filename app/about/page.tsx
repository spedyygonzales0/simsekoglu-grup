"use client";

import { useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { CtaBanner } from "@/components/shared/cta-banner";
import { PageHero } from "@/components/shared/page-hero";
import { SectionTitle } from "@/components/shared/section-title";
import { defaultSiteContent } from "@/lib/data/default-site-content";

export default function AboutPage() {
  const { locale, content } = useSiteData();
  const [videoFailed, setVideoFailed] = useState(false);
  const aboutTextTr = (content.about.descriptionTr || "").trim();
  const aboutTextEn = (content.about.descriptionEn || "").trim();
  const aboutVideoUrl = (content.about.videoUrl || defaultSiteContent.about.videoUrl || "").trim();

  const fullText = locale === "tr" ? aboutTextTr : aboutTextEn;
  const paragraphs = fullText
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const heroDescription = paragraphs[0] || fullText;

  return (
    <>
      <PageHero
        eyebrow={locale === "tr" ? "Hakkımızda" : "About Us"}
        title={locale === "tr" ? content.about.titleTr : content.about.titleEn}
        description={heroDescription}
      />

      <section className="section-spacing">
        <div className="container-wide rounded-3xl p-6 sm:p-8 lg:p-10 surface-shell">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <SectionTitle
              eyebrow={locale === "tr" ? "Kurumsal Kimlik" : "Corporate Identity"}
              title={
                locale === "tr"
                  ? "Uzun Vadeli Değer Yaratan Proje Ortağı"
                  : "A Long-Term Value Creating Project Partner"
              }
              description={
                paragraphs[0] ||
                (locale === "tr"
                  ? "Kurumsal kimlik metnini yönetim panelinden güncelleyebilirsiniz."
                  : "You can update corporate identity text from the admin panel.")
              }
            />
            <div className="space-y-4">
              {(paragraphs.length ? paragraphs.slice(1) : []).map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="body-text leading-8 text-navy-900/84">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-navy-900/15 bg-cloud-100 shadow-soft">
              {!videoFailed && aboutVideoUrl ? (
                <video
                  src={aboutVideoUrl}
                  className="h-72 w-full object-cover sm:h-80 lg:h-[360px]"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onError={() => setVideoFailed(true)}
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-navy-900/95 px-6 text-center sm:h-80 lg:h-[360px]">
                  <p className="body-text font-semibold text-white/92">
                    {locale === "tr"
                      ? "Hakkımızda videosu yakında eklenecektir."
                      : "About video will be added soon."}
                  </p>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-navy-900/15 bg-white p-8 shadow-soft">
              <h3 className="font-display text-2xl font-semibold text-navy-900">
                {locale === "tr" ? content.about.valuesTitleTr : content.about.valuesTitleEn}
              </h3>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-navy-900/82">
                <li>• {locale === "tr" ? "Operasyonel mükemmeliyet" : "Operational excellence"}</li>
                <li>
                  • {locale === "tr" ? "Şeffaf iletişim ve raporlama" : "Transparent communication and reporting"}
                </li>
                <li>
                  • {locale === "tr" ? "Kalite ve güvenlik odaklı süreç yönetimi" : "Quality and safety-focused process management"}
                </li>
                <li>• {locale === "tr" ? "Sürdürülebilir yatırım anlayışı" : "Sustainable investment mindset"}</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
