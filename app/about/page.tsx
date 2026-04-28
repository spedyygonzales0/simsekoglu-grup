"use client";

import Image from "next/image";
import { useSiteData } from "@/components/providers/site-data-provider";
import { CtaBanner } from "@/components/shared/cta-banner";
import { PageHero } from "@/components/shared/page-hero";
import { SectionTitle } from "@/components/shared/section-title";

export default function AboutPage() {
  const { locale, content } = useSiteData();

  return (
    <>
      <PageHero
        eyebrow={locale === "tr" ? "Hakkımızda" : "About Us"}
        title={locale === "tr" ? content.about.titleTr : content.about.titleEn}
        description={locale === "tr" ? content.about.descriptionTr : content.about.descriptionEn}
      />

      <section className="section-spacing">
        <div className="container-wide grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <SectionTitle
              eyebrow={locale === "tr" ? "Kurumsal Kimlik" : "Corporate Identity"}
              title={
                locale === "tr"
                  ? "Uzun Vadeli Değer Yaratan Proje Ortağı"
                  : "A Long-Term Value Creating Project Partner"
              }
              description={locale === "tr" ? content.about.descriptionTr : content.about.descriptionEn}
            />
            <p className="text-navy-900/70">
              {locale === "tr"
                ? "Kurumsal yönetim yaklaşımımız farklı iş kollarını tek çatı altında koordine eder. Tasarım, uygulama ve operasyon süreçlerinde sürdürülebilir iş ortaklığı sunarız."
                : "Our management model coordinates multiple business lines under one roof. We provide sustainable partnership from design to execution and operations."}
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative min-h-64 overflow-hidden rounded-2xl border border-navy-900/10 bg-cloud-100">
              {/* Replace with official about image under /public/images/general */}
              <Image
                src="/images/general/about-placeholder.svg"
                alt="About placeholder"
                fill
                sizes="(max-width: 1024px) 100vw, 540px"
                className="object-cover"
              />
            </div>
            <div className="glass-card p-8">
              <h3 className="font-display text-2xl text-navy-900">
                {locale === "tr" ? content.about.valuesTitleTr : content.about.valuesTitleEn}
              </h3>
              <ul className="mt-5 space-y-4 text-sm text-navy-900/75">
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
      </section>

      <CtaBanner />
    </>
  );
}
