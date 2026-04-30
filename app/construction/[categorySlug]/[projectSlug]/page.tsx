"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { ProjectDetailLayout } from "@/components/projects/project-detail-layout";
import { getConstructionPortfolioData } from "@/lib/data/construction-portfolio";

export default function ConstructionProjectDetailPage() {
  const { locale, content } = useSiteData();
  const params = useParams<{ categorySlug: string; projectSlug: string }>();
  const categorySlug = params?.categorySlug || "";
  const projectSlug = params?.projectSlug || "";

  const { categories, projects } = useMemo(
    () =>
      getConstructionPortfolioData({
        constructionContent: content.construction,
        projectCardTexts: content.projectCardTexts?.construction
      }),
    [content.construction, content.projectCardTexts]
  );

  const category = categories.find((item) => item.slug === categorySlug) || null;
  const project = projects.find((item) => item.categorySlug === categorySlug && item.slug === projectSlug) || null;

  const gallery = project?.images?.length ? project.images : ["/images/construction/project-placeholder-1.svg"];

  if (!category || !project) {
    return (
      <section className="section-spacing">
        <div className="container-wide">
          <div className="rounded-xl border border-navy-900/15 bg-white px-6 py-10 text-center">
            <h1 className="page-title text-navy-900">{locale === "tr" ? "Proje bulunamadı" : "Project not found"}</h1>
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
    <ProjectDetailLayout
      locale={locale}
      breadcrumb={
        <>
          <Link href="/construction" className="hover:text-navy-900">
            {locale === "tr" ? "İnşaat" : "Construction"}
          </Link>
          <span>/</span>
          <Link href={`/construction/${categorySlug}`} className="hover:text-navy-900">
            {locale === "tr" ? category.titleTr : category.titleEn}
          </Link>
          <span>/</span>
          <span className="text-navy-900">{locale === "tr" ? project.titleTr : project.titleEn}</span>
        </>
      }
      backHref={`/construction/${categorySlug}`}
      backLabel={locale === "tr" ? "Geri Dön" : "Back"}
      title={locale === "tr" ? project.titleTr : project.titleEn}
      shortDescription={locale === "tr" ? project.summaryTr : project.summaryEn}
      detailedDescription={locale === "tr" ? project.detailedTr : project.detailedEn}
      categoryLabel={locale === "tr" ? category.titleTr : category.titleEn}
      locationLabel={locale === "tr" ? project.locationTr : project.locationEn}
      statusLabel={locale === "tr" ? project.statusTr : project.statusEn}
      images={gallery}
      videoUrl={project.videoUrl}
    />
  );
}
