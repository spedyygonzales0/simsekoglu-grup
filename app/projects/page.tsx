"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { useSiteData } from "@/components/providers/site-data-provider";
import { CtaBanner } from "@/components/shared/cta-banner";
import { PageHero } from "@/components/shared/page-hero";
import { SectionTitle } from "@/components/shared/section-title";
import { getSafeProjectGalleryImages, getSafeProjectVideo } from "@/lib/data/image-map";
import { projectStatusLabel, serviceTypeLabel, t } from "@/lib/i18n";
import { Project, ProjectCategory } from "@/lib/types";

const MediaLightbox = dynamic(
  () => import("@/components/media/media-lightbox").then((mod) => mod.MediaLightbox),
  { ssr: false }
);

type FilterType = "all" | ProjectCategory;

const categoryLabels: Record<ProjectCategory, { tr: string; en: string }> = {
  construction: { tr: "İnşaat", en: "Construction" },
  architecture: { tr: "Mimarlık", en: "Architecture" },
  fleet: { tr: "Filo", en: "Fleet" }
};

const categoryDescriptions: Record<ProjectCategory, { tr: string; en: string }> = {
  construction: {
    tr: "Saha uygulaması, taahhüt ve teslim odaklı yapım projeleri.",
    en: "Execution and delivery focused construction projects."
  },
  architecture: {
    tr: "Konsept, çizim ve uygulama koordinasyonu odaklı mimarlık projeleri.",
    en: "Architecture projects focused on concept, drawing, and design coordination."
  },
  fleet: {
    tr: "Kurumsal araç dönüşümü ve filo operasyon geliştirme projeleri.",
    en: "Corporate vehicle transformation and fleet operation projects."
  }
};

const categoryGuides: Record<
  ProjectCategory,
  { focus: { tr: string; en: string }; highlights: { tr: string[]; en: string[] } }
> = {
  construction: {
    focus: {
      tr: "Saha uygulaması ve teslim",
      en: "Site execution and delivery"
    },
    highlights: {
      tr: ["Şantiye yönetimi", "Yapım süreçleri", "Teslim ve kalite kontrol"],
      en: ["Site management", "Construction process", "Handover and quality control"]
    }
  },
  architecture: {
    focus: {
      tr: "Tasarım, çizim ve konsept",
      en: "Design, drawing, and concept"
    },
    highlights: {
      tr: ["Mimari konsept", "Teknik çizim", "Mekan planlama"],
      en: ["Architectural concept", "Technical drawing", "Spatial planning"]
    }
  },
  fleet: {
    focus: {
      tr: "Filo planlama ve operasyon",
      en: "Fleet planning and operations"
    },
    highlights: {
      tr: ["Araç dönüşümü", "Operasyon yönetimi", "Maliyet optimizasyonu"],
      en: ["Vehicle transformation", "Operations management", "Cost optimization"]
    }
  }
};

export default function ProjectsPage() {
  const { locale, content } = useSiteData();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const filteredProjects = useMemo(
    () =>
      content.projects.filter((project) => {
        if (filter === "all") return true;
        return project.category === filter;
      }),
    [content.projects, filter]
  );

  const categoryCounts = useMemo(
    () => ({
      construction: content.projects.filter((project) => project.category === "construction").length,
      architecture: content.projects.filter((project) => project.category === "architecture").length,
      fleet: content.projects.filter((project) => project.category === "fleet").length
    }),
    [content.projects]
  );

  return (
    <>
      <PageHero
        eyebrow={t(locale, "projects")}
        title={
          locale === "tr"
            ? "Tamamlanan ve Devam Eden Projelerimiz"
            : "Our Completed and Ongoing Projects"
        }
        description={
          locale === "tr"
            ? "İnşaat, mimarlık ve filo dönüşüm projelerinde farklı ölçeklerde üretilen kurumsal çözümler."
            : "Corporate solutions produced across multiple scales in construction, architecture, and fleet transformation."
        }
      />

      <section className="section-spacing">
        <div className="container-wide">
          <SectionTitle
            title={locale === "tr" ? "Proje Portföyü" : "Project Portfolio"}
            rightSlot={
              <div className="flex flex-wrap gap-2">
                {(["all", "construction", "architecture", "fleet"] as FilterType[]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      filter === category
                        ? "bg-navy-900 text-white"
                        : "border border-navy-900/20 bg-white text-navy-900 hover:border-gold-500 hover:text-gold-500"
                    }`}
                    onClick={() => setFilter(category)}
                  >
                    {category === "all"
                      ? `${t(locale, "all")} (${content.projects.length})`
                      : `${categoryLabels[category][locale]} (${categoryCounts[category]})`}
                  </button>
                ))}
              </div>
            }
          />

          <div className="mb-6 rounded-2xl border border-navy-900/10 bg-white p-4 sm:p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-gold-600">
              {locale === "tr" ? "Kategori Rehberi" : "Category Guide"}
            </p>
            <h3 className="mt-2 font-display text-2xl text-navy-900">
              {locale === "tr"
                ? "İnşaat ve Mimarlık Projelerini Hızlıca Ayırın"
                : "Quickly Distinguish Construction and Architecture Projects"}
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {(Object.keys(categoryDescriptions) as ProjectCategory[]).map((category) => (
                <div key={category} className="rounded-2xl border border-navy-900/10 bg-cloud-50 p-4">
                  <p className="text-sm font-semibold text-navy-900">{categoryLabels[category][locale]}</p>
                  <p className="mt-2 text-xs text-navy-900/70">{categoryDescriptions[category][locale]}</p>
                  <p className="mt-3 text-xs font-semibold text-navy-900">
                    {locale === "tr" ? "Odak" : "Focus"}: {categoryGuides[category].focus[locale]}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categoryGuides[category].highlights[locale].map((item) => (
                      <span
                        key={`${category}-${item}`}
                        className="rounded-full border border-navy-900/15 bg-white px-2.5 py-1 text-[11px] text-navy-900/75"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-semibold text-gold-700">
                    {locale === "tr" ? "Toplam Proje" : "Total Projects"}: {categoryCounts[category]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="mb-6 rounded-xl border border-gold-500/30 bg-gold-50 px-4 py-3 text-sm text-navy-900/80">
            {locale === "tr"
              ? "Not: İnşaat projeleri sahada uygulama ve teslim odaklıdır. Mimarlık projeleri ise tasarım, çizim ve konsept geliştirme odaklıdır."
              : "Note: Construction projects focus on on-site execution and delivery, while architecture projects focus on design, drawing, and concept development."}
          </p>

          {filteredProjects.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={(item, imageIndex = 0) => {
                    setSelectedProject(item);
                    setSelectedImageIndex(imageIndex);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-navy-900/20 bg-white p-8 text-center text-sm text-navy-900/65">
              {locale === "tr" ? "Bu filtrede proje bulunamadı." : "No projects available for this filter."}
            </div>
          )}
        </div>
      </section>

      {selectedProject ? (
        <MediaLightbox
          isOpen={Boolean(selectedProject)}
          onClose={() => setSelectedProject(null)}
          title={locale === "tr" ? selectedProject.titleTr : selectedProject.titleEn}
          categoryLabel={serviceTypeLabel(selectedProject.category, locale)}
          location={locale === "tr" ? selectedProject.locationTr : selectedProject.locationEn}
          statusLabel={projectStatusLabel(selectedProject.status, locale)}
          description={locale === "tr" ? selectedProject.descriptionTr : selectedProject.descriptionEn}
          images={getSafeProjectGalleryImages(selectedProject)}
          initialIndex={selectedImageIndex}
          videoUrl={getSafeProjectVideo(selectedProject)}
        />
      ) : null}

      <CtaBanner />
    </>
  );
}
