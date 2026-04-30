"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { QuoteButton } from "@/components/shared/quote-button";
import { SectionTitle } from "@/components/shared/section-title";
import { getArchitecturePortfolioData } from "@/lib/services/architecture-service";
import { ArchitectureCategory, ArchitectureProject } from "@/lib/types";

const ARCHITECTURE_PLACEHOLDER = "/images/architecture/project-placeholder-1.svg";

export default function ArchitectureCategoryPage() {
  const { locale } = useSiteData();
  const params = useParams<{ categorySlug: string }>();
  const [categorySlug, setCategorySlug] = useState("");
  const [category, setCategory] = useState<ArchitectureCategory | null>(null);
  const [projects, setProjects] = useState<ArchitectureProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategorySlug(params?.categorySlug || "");
  }, [params?.categorySlug]);

  useEffect(() => {
    if (!categorySlug) return;
    let mounted = true;
    (async () => {
      const data = await getArchitecturePortfolioData();
      if (!mounted) return;
      const foundCategory = data.categories.find((item) => item.slug === categorySlug && item.active) || null;
      setCategory(foundCategory);
      setProjects(
        data.projects.filter(
          (project) => project.active && Boolean(foundCategory) && project.categoryId === foundCategory?.id
        )
      );
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [categorySlug]);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.sortOrder - b.sortOrder),
    [projects]
  );

  if (!loading && !category) {
    return (
      <section className="section-spacing">
        <div className="container-wide">
          <div className="rounded-xl border border-navy-900/15 bg-white px-6 py-10 text-center">
            <h1 className="page-title text-navy-900">
              {locale === "tr" ? "Kategori bulunamadı" : "Category not found"}
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

  return (
    <section className="section-spacing">
      <div className="container-wide">
        <div className="mb-6">
          <Link href="/architecture" className="small-note text-navy-900/70 hover:text-navy-900">
            {locale === "tr" ? "← Mimarlık Kategorileri" : "← Architecture Categories"}
          </Link>
        </div>

        <SectionTitle
          title={locale === "tr" ? category?.titleTr || "" : category?.titleEn || ""}
          description={locale === "tr" ? category?.descriptionTr || "" : category?.descriptionEn || ""}
        />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-[360px] animate-pulse rounded-2xl border border-navy-900/10 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedProjects.map((project) => (
              <article
                key={project.id}
                className="group overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={project.coverImageUrl || ARCHITECTURE_PLACEHOLDER}
                    alt={locale === "tr" ? project.titleTr : project.titleEn}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/20 to-transparent" />
                </div>
                <div className="space-y-3 p-6">
                  <h2 className="card-title text-2xl text-navy-900">{locale === "tr" ? project.titleTr : project.titleEn}</h2>
                  <p className="body-text min-h-[70px] text-navy-900/78">
                    {locale === "tr" ? project.shortDescriptionTr : project.shortDescriptionEn}
                  </p>
                  <div className="small-note flex flex-wrap gap-3 text-navy-900/70">
                    {(locale === "tr" ? project.locationTr : project.locationEn) ? (
                      <span>{locale === "tr" ? project.locationTr : project.locationEn}</span>
                    ) : null}
                    {(locale === "tr" ? project.statusTr : project.statusEn) ? (
                      <span className="rounded-full border border-gold-500/40 bg-gold-50 px-2 py-0.5 text-gold-700">
                        {locale === "tr" ? project.statusTr : project.statusEn}
                      </span>
                    ) : null}
                  </div>
                  <Link
                    href={`/architecture/${categorySlug}/${project.slug}`}
                    className="inline-flex rounded-xl border border-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-gold-500 hover:text-navy-950"
                  >
                    {locale === "tr" ? "Projeyi İncele" : "View Project"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !sortedProjects.length ? (
          <div className="mt-6 rounded-xl border border-navy-900/15 bg-white px-6 py-10 text-center text-navy-900/70">
            {locale === "tr"
              ? "Bu kategori için henüz aktif proje bulunmuyor."
              : "There are no active projects for this category yet."}
          </div>
        ) : null}

        <div className="mt-10 flex justify-start">
          <QuoteButton
            serviceType="architecture"
            selectedLabel={locale === "tr" ? "Mimarlık Hizmeti Teklifi" : "Architecture Service Quote"}
            showFormButton={false}
          />
        </div>
      </div>
    </section>
  );
}
