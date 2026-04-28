"use client";

import { ProjectGalleryCard } from "@/components/projects/project-gallery-card";
import { useSiteData } from "@/components/providers/site-data-provider";
import { getSafeProjectGalleryImages } from "@/lib/data/image-map";
import { getProjectSlug } from "@/lib/data/project-slug";
import { projectStatusLabel, serviceTypeLabel } from "@/lib/i18n";
import { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  onOpen?: (project: Project, index?: number) => void;
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const { locale } = useSiteData();
  const title = locale === "tr" ? project.titleTr : project.titleEn;
  const summary = locale === "tr" ? project.summaryTr : project.summaryEn;
  const location = locale === "tr" ? project.locationTr : project.locationEn;
  const detailHref = `/projeler/${getProjectSlug(project)}`;

  return (
    <ProjectGalleryCard
      title={title}
      categoryLabel={serviceTypeLabel(project.category, locale)}
      shortInfo={summary}
      location={location}
      statusLabel={projectStatusLabel(project.status, locale)}
      description={locale === "tr" ? project.descriptionTr : project.descriptionEn}
      images={getSafeProjectGalleryImages(project)}
      carouselActive={project.carouselActive}
      carouselSpeed={project.carouselSpeed}
      detailHref={detailHref}
      detailLabel={locale === "tr" ? "Detayları Gör" : "View Details"}
      onOpen={onOpen ? (index) => onOpen(project, index) : undefined}
    />
  );
}
