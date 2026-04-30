"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { QuoteButton } from "@/components/shared/quote-button";
import { SectionTitle } from "@/components/shared/section-title";
import { getConstructionPortfolioData } from "@/lib/data/construction-portfolio";

export default function ConstructionCategoryPage() {
  const { locale, content } = useSiteData();
  const params = useParams<{ categorySlug: string }>();
  const categorySlug = params?.categorySlug || "";

  const { categories, projects } = useMemo(
    () =>
      getConstructionPortfolioData({
        constructionContent: content.construction,
        projectCardTexts: content.projectCardTexts?.construction
      }),
    [content.construction, content.projectCardTexts]
  );

  const category = categories.find((item) => item.slug === categorySlug) || null;
  const categoryProjects = projects.filter((item) => item.categorySlug === categorySlug);

  if (!category) {
    return (
      <section className="section-spacing">
        <div className="container-wide">
          <div className="rounded-xl border border-navy-900/15 bg-white px-6 py-10 text-center">
            <h1 className="page-title text-navy-900">{locale === "tr" ? "Kategori bulunamadı" : "Category not found"}</h1>
            <Link
              href="/construction"
              className="mt-4 inline-flex rounded-xl border border-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-500"
            >
              {locale === "tr" ? "İnşaat Kategorilerine Dön" : "Back to Construction Categories"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-spacing">
      <div className="container-wide">
        <div className="mb-6">
          <Link href="/construction" className="small-note text-navy-900/70 hover:text-navy-900">
            {locale === "tr" ? "← İnşaat Kategorileri" : "← Construction Categories"}
          </Link>
        </div>

        <SectionTitle
          title={locale === "tr" ? category.titleTr : category.titleEn}
          description={locale === "tr" ? category.descriptionTr : category.descriptionEn}
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categoryProjects.map((project) => (
            <article
              key={project.id}
              className="group overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={project.coverImageUrl}
                  alt={locale === "tr" ? project.titleTr : project.titleEn}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/65 via-navy-950/20 to-transparent" />
              </div>
              <div className="space-y-3 p-6">
                <h2 className="card-title text-2xl text-navy-900">{locale === "tr" ? project.titleTr : project.titleEn}</h2>
                <p className="body-text min-h-[70px] text-navy-900/78">
                  {locale === "tr" ? project.summaryTr : project.summaryEn}
                </p>
                <div className="small-note flex flex-wrap gap-3 text-navy-900/70">
                  <span>{locale === "tr" ? project.locationTr : project.locationEn}</span>
                  <span className="rounded-full border border-gold-500/40 bg-gold-50 px-2 py-0.5 text-gold-700">
                    {locale === "tr" ? project.statusTr : project.statusEn}
                  </span>
                </div>
                <Link
                  href={`/construction/${category.slug}/${project.slug}`}
                  className="inline-flex rounded-xl border border-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-gold-500 hover:text-navy-950"
                >
                  {locale === "tr" ? "Projeyi İncele" : "View Project"}
                </Link>
              </div>
            </article>
          ))}
        </div>

        {!categoryProjects.length ? (
          <div className="mt-6 rounded-xl border border-navy-900/15 bg-white px-6 py-10 text-center text-navy-900/70">
            {locale === "tr"
              ? "Bu kategori için henüz aktif proje bulunmuyor."
              : "There are no active projects for this category yet."}
          </div>
        ) : null}

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

