"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { useSiteData } from "@/components/providers/site-data-provider";
import { CtaBanner } from "@/components/shared/cta-banner";
import { PageHero } from "@/components/shared/page-hero";
import { QuoteButton } from "@/components/shared/quote-button";
import { SectionTitle } from "@/components/shared/section-title";
import { getSafeProjectGalleryImages, getSafeProjectVideo } from "@/lib/data/image-map";
import { projectStatusLabel, serviceTypeLabel } from "@/lib/i18n";
import { Project } from "@/lib/types";

const MediaLightbox = dynamic(
  () => import("@/components/media/media-lightbox").then((mod) => mod.MediaLightbox),
  { ssr: false }
);

export default function ArchitecturePage() {
  const { locale, content } = useSiteData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const architectureProjects = useMemo(
    () => content.projects.filter((project) => project.category === "architecture"),
    [content.projects]
  );

  const services = [
    {
      tr: "İç Mimarlık",
      en: "Interior Architecture",
      descriptionTr: content.architecture.interiorTr,
      descriptionEn: content.architecture.interiorEn
    },
    {
      tr: "Dış Mimarlık",
      en: "Exterior Architecture",
      descriptionTr: content.architecture.exteriorTr,
      descriptionEn: content.architecture.exteriorEn
    },
    {
      tr: "Proje Çizimi",
      en: "Project Drawing",
      descriptionTr: content.architecture.drawingTr,
      descriptionEn: content.architecture.drawingEn
    },
    {
      tr: "Konsept Tasarım",
      en: "Concept Design",
      descriptionTr: content.architecture.conceptTr,
      descriptionEn: content.architecture.conceptEn
    }
  ];

  return (
    <>
      <PageHero
        eyebrow={locale === "tr" ? "Mimarlık" : "Architecture"}
        title={locale === "tr" ? content.architecture.titleTr : content.architecture.titleEn}
        description={locale === "tr" ? content.architecture.descriptionTr : content.architecture.descriptionEn}
      />

      <section className="section-spacing">
        <div className="container-wide">
          <SectionTitle
            title={locale === "tr" ? "Mimari Hizmetler" : "Architecture Services"}
            description={
              locale === "tr"
                ? "Her ölçekte proje için konseptten uygulamaya güçlü tasarım altyapısı."
                : "Strong design infrastructure from concept to implementation for every scale."
            }
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.tr} className="glass-card p-6">
                <h3 className="font-display text-2xl text-navy-900">{locale === "tr" ? service.tr : service.en}</h3>
                <p className="mt-2 text-sm text-navy-900/70">
                  {locale === "tr" ? service.descriptionTr : service.descriptionEn}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-start">
            <QuoteButton
              serviceType="architecture"
              selectedLabel={locale === "tr" ? "Mimarlık Hizmeti Teklifi" : "Architecture Service Quote"}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-wide">
          <SectionTitle title={locale === "tr" ? "Örnek Projeler ve Galeri" : "Sample Projects and Visual Gallery"} />
          <p className="mb-6 rounded-xl border border-gold-500/30 bg-gold-50 px-4 py-3 text-sm text-navy-900/80">
            {locale === "tr"
              ? "Bu bölüm tasarım, çizim ve konsept odaklı mimarlık projelerini gösterir. Uygulama odaklı işler için İnşaat sayfasını inceleyin."
              : "This section shows design, drawing, and concept focused architecture projects. For execution-focused work, visit the Construction page."}
          </p>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {architectureProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={(item, imageIndex = 0) => {
                  setSelectedProject(item);
                  setSelectedImageIndex(imageIndex);
                }}
              />
            ))}

            {!architectureProjects.length ? (
              <div className="rounded-2xl border border-dashed border-navy-900/20 bg-cloud-50 p-8 text-sm text-navy-900/60">
                {locale === "tr" ? "Yakında Proje Eklenecek" : "Projects Coming Soon"}
              </div>
            ) : null}
          </div>
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
