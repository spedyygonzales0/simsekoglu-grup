"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { QuoteButton } from "@/components/shared/quote-button";
import { SectionTitle } from "@/components/shared/section-title";
import { getConstructionPortfolioData } from "@/lib/data/construction-portfolio";

export default function ConstructionPage() {
  const { locale, content } = useSiteData();

  const { categories } = useMemo(
    () =>
      getConstructionPortfolioData({
        constructionContent: content.construction,
        projectCardTexts: content.projectCardTexts?.construction
      }),
    [content.construction, content.projectCardTexts]
  );

  return (
    <section className="section-spacing">
      <div className="container-wide">
        <SectionTitle
          title={locale === "tr" ? "İnşaat Kategorileri" : "Construction Categories"}
          description={
            locale === "tr"
              ? "İnşaat portföyümüzü proje türüne göre inceleyin."
              : "Explore our construction portfolio by project type."
          }
        />

        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <article
              key={category.slug}
              className="group overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={category.coverImageUrl}
                  alt={locale === "tr" ? category.titleTr : category.titleEn}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/65 via-navy-950/20 to-transparent" />
              </div>
              <div className="space-y-4 p-6">
                <h2 className="card-title text-2xl text-navy-900">
                  {locale === "tr" ? category.titleTr : category.titleEn}
                </h2>
                <p className="body-text min-h-[72px] text-navy-900/78">
                  {locale === "tr" ? category.descriptionTr : category.descriptionEn}
                </p>
                <Link
                  href={`/construction/${category.slug}`}
                  className="inline-flex rounded-xl border border-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-gold-500 hover:text-navy-950"
                >
                  {locale === "tr" ? "Projeleri İncele" : "Explore Projects"}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-start">
          <QuoteButton
            serviceType="construction"
            selectedLabel={locale === "tr" ? "İnşaat Hizmeti Teklifi" : "Construction Service Quote"}
            showFormButton={false}
          />
        </div>
      </div>
    </section>
  );
}

