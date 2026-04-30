"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { ProjectDetailLayout } from "@/components/projects/project-detail-layout";
import { getArchitecturePortfolioData } from "@/lib/services/architecture-service";
import { ArchitectureCategory, ArchitectureProject } from "@/lib/types";

const ARCHITECTURE_PLACEHOLDER = "/images/architecture/project-placeholder-1.svg";

function sortGalleryImages(images: string[]): string[] {
  const unique = Array.from(new Set(images.filter(Boolean)));
  const real = unique.filter((item) => item !== ARCHITECTURE_PLACEHOLDER);
  const placeholders = unique.filter((item) => item === ARCHITECTURE_PLACEHOLDER);
  return [...real, ...placeholders];
}

export default function ArchitectureProjectDetailPage() {
  const { locale } = useSiteData();
  const params = useParams<{ categorySlug: string; projectSlug: string }>();
  const [categorySlug, setCategorySlug] = useState("");
  const [projectSlug, setProjectSlug] = useState("");
  const [category, setCategory] = useState<ArchitectureCategory | null>(null);
  const [project, setProject] = useState<ArchitectureProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategorySlug(params?.categorySlug || "");
    setProjectSlug(params?.projectSlug || "");
  }, [params?.categorySlug, params?.projectSlug]);

  useEffect(() => {
    if (!categorySlug || !projectSlug) return;
    let mounted = true;
    (async () => {
      const data = await getArchitecturePortfolioData();
      if (!mounted) return;

      const foundCategory = data.categories.find((item) => item.slug === categorySlug && item.active) || null;
      setCategory(foundCategory);

      const foundProject =
        data.projects.find(
          (item) => item.active && item.slug === projectSlug && Boolean(foundCategory) && item.categoryId === foundCategory?.id
        ) || null;
      setProject(foundProject);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [categorySlug, projectSlug]);

  const gallery = useMemo(() => {
    if (!project) return [ARCHITECTURE_PLACEHOLDER];
    const sorted = sortGalleryImages([project.coverImageUrl, ...(project.galleryImageUrls || [])]);
    return sorted.length ? sorted : [ARCHITECTURE_PLACEHOLDER];
  }, [project]);

  if (!loading && (!category || !project)) {
    return (
      <section className="section-spacing">
        <div className="container-wide">
          <div className="rounded-xl border border-navy-900/15 bg-white px-6 py-10 text-center">
            <h1 className="page-title text-navy-900">
              {locale === "tr" ? "Proje bulunamadı" : "Project not found"}
            </h1>
            <Link
              href="/architecture"
              className="mt-4 inline-flex rounded-xl border border-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-500"
            >
              {locale === "tr" ? "Mimarlık Kategorilerine Dön" : "Back to Architecture Categories"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (loading || !category || !project) {
    return (
      <section className="section-spacing">
        <div className="container-wide">
          <div className="mx-auto max-w-[1380px] space-y-6">
            <div className="h-6 w-72 animate-pulse rounded bg-cloud-100" />
            <div className="grid gap-6 lg:grid-cols-[1.28fr_0.72fr]">
              <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-soft">
                <div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-cloud-100" />
              </div>
              <div className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-soft">
                <div className="h-9 w-2/3 animate-pulse rounded bg-cloud-100" />
                <div className="mt-4 h-5 w-full animate-pulse rounded bg-cloud-100" />
                <div className="mt-2 h-5 w-5/6 animate-pulse rounded bg-cloud-100" />
                <div className="mt-6 h-28 w-full animate-pulse rounded-xl bg-cloud-100" />
              </div>
            </div>
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
          <Link href="/architecture" className="hover:text-navy-900">
            {locale === "tr" ? "Mimarlık" : "Architecture"}
          </Link>
          <span>/</span>
          <Link href={`/architecture/${categorySlug}`} className="hover:text-navy-900">
            {locale === "tr" ? category?.titleTr : category?.titleEn}
          </Link>
          <span>/</span>
          <span className="text-navy-900">{locale === "tr" ? project?.titleTr : project?.titleEn}</span>
        </>
      }
      backHref={`/architecture/${categorySlug}`}
      backLabel={locale === "tr" ? "Geri Dön" : "Back"}
      title={locale === "tr" ? project?.titleTr || "" : project?.titleEn || ""}
      subtitle={locale === "tr" ? project?.subtitleTr || "" : project?.subtitleEn || ""}
      shortDescription={locale === "tr" ? project?.shortDescriptionTr || "" : project?.shortDescriptionEn || ""}
      detailedDescription={locale === "tr" ? project?.detailedDescriptionTr || "" : project?.detailedDescriptionEn || ""}
      categoryLabel={locale === "tr" ? category?.titleTr || "" : category?.titleEn || ""}
      locationLabel={locale === "tr" ? project?.locationTr || "" : project?.locationEn || ""}
      statusLabel={locale === "tr" ? project?.statusTr || "" : project?.statusEn || ""}
      yearLabel={project?.year || ""}
      images={gallery}
      videoUrl={undefined}
    />
  );
}
