"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { ProjectGalleryCard } from "@/components/projects/project-gallery-card";
import { CtaBanner } from "@/components/shared/cta-banner";
import { PageHero } from "@/components/shared/page-hero";
import { PlaceholderMedia } from "@/components/shared/placeholder-media";
import { QuoteButton } from "@/components/shared/quote-button";
import { SectionTitle } from "@/components/shared/section-title";
import { constructionProjectMediaManifest } from "@/lib/data/construction-media-manifest";
import { ConstructionProjectMedia } from "@/lib/types";

const MediaLightbox = dynamic(
  () => import("@/components/media/media-lightbox").then((mod) => mod.MediaLightbox),
  { ssr: false }
);

interface ConstructionGalleryItem {
  projectId: string;
  title: string;
  categoryLabel: string;
  shortInfo: string;
  location: string;
  statusLabel: string;
  description: string;
  images: string[];
  videoUrl?: string;
}

const CONSTRUCTION_PLACEHOLDER = "/images/construction/project-placeholder-1.svg";

export default function ConstructionPage() {
  const { locale, content } = useSiteData();
  const [selectedItem, setSelectedItem] = useState<ConstructionGalleryItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const serviceAreas = [
    {
      titleTr: "Konut Projeleri",
      titleEn: "Residential Projects",
      bodyTr: content.construction.residentialTr,
      bodyEn: content.construction.residentialEn
    },
    {
      titleTr: "Ticari Yapılar",
      titleEn: "Commercial Buildings",
      bodyTr: content.construction.commercialTr,
      bodyEn: content.construction.commercialEn
    },
    {
      titleTr: "Renovasyon",
      titleEn: "Renovation",
      bodyTr: content.construction.renovationTr,
      bodyEn: content.construction.renovationEn
    },
    {
      titleTr: "Anahtar Teslim",
      titleEn: "Turnkey Delivery",
      bodyTr: content.construction.turnkeyTr,
      bodyEn: content.construction.turnkeyEn
    }
  ];

  const uploadedMedia = useMemo(
    () =>
      constructionProjectMediaManifest.filter(
        (project) => project.photos.length > 0 || project.videos.length > 0
      ),
    []
  );

  const mapMediaToCardItem = useCallback(
    (project: ConstructionProjectMedia): ConstructionGalleryItem => {
      const isHousing = project.projectId.startsWith("KNT-");
      const photoCount = project.photos.length;
      const videoCount = project.videos.length;
      const images = project.photos.length ? project.photos : [CONSTRUCTION_PLACEHOLDER];

      return {
        projectId: project.projectId,
        title: project.projectId,
        categoryLabel: isHousing
          ? locale === "tr"
            ? "Konut Projesi"
            : "Residential Project"
          : locale === "tr"
            ? "Fabrika / Sanayi Projesi"
            : "Factory / Industrial Project",
        shortInfo:
          locale === "tr"
            ? `${photoCount} fotoğraf, ${videoCount} video`
            : `${photoCount} photos, ${videoCount} videos`,
        location: locale === "tr" ? "Türkiye" : "Turkey",
        statusLabel:
          videoCount > 0
            ? locale === "tr"
              ? "Devam Ediyor"
              : "Ongoing"
            : locale === "tr"
              ? "Medya Güncelleniyor"
              : "Media Updating",
        description:
          locale === "tr"
            ? `${project.projectId} için yüklenen saha görselleri ve proje kayıtları.`
            : `Uploaded field visuals and project records for ${project.projectId}.`,
        images,
        videoUrl: project.videos[0]
      };
    },
    [locale]
  );

  const housingItems = useMemo(
    () => uploadedMedia.filter((item) => item.projectId.startsWith("KNT-")).map(mapMediaToCardItem),
    [mapMediaToCardItem, uploadedMedia]
  );

  const factoryItems = useMemo(
    () => uploadedMedia.filter((item) => item.projectId.startsWith("FBK-")).map(mapMediaToCardItem),
    [mapMediaToCardItem, uploadedMedia]
  );

  return (
    <>
      <PageHero
        eyebrow={locale === "tr" ? "İnşaat" : "Construction"}
        title={locale === "tr" ? content.construction.titleTr : content.construction.titleEn}
        description={locale === "tr" ? content.construction.descriptionTr : content.construction.descriptionEn}
      />

      <section className="section-spacing">
        <div className="container-wide">
          <SectionTitle
            title={locale === "tr" ? "Hizmet Kapsamımız" : "Our Construction Scope"}
            description={
              locale === "tr"
                ? "Uygulama, planlama ve saha koordinasyonunda tek noktadan yönetim modeli."
                : "Single-point management model for planning, implementation, and site coordination."
            }
          />
          <div className="grid gap-5 md:grid-cols-2">
            {serviceAreas.map((item) => (
              <div key={item.titleTr} className="glass-card p-6">
                <h3 className="font-display text-2xl text-navy-900">
                  {locale === "tr" ? item.titleTr : item.titleEn}
                </h3>
                <p className="mt-2 text-sm text-navy-900/70">{locale === "tr" ? item.bodyTr : item.bodyEn}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-start">
            <QuoteButton
              serviceType="construction"
              selectedLabel={locale === "tr" ? "İnşaat Hizmeti Teklifi" : "Construction Service Quote"}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-wide space-y-10">
          <SectionTitle
            title={locale === "tr" ? "İnşaat Medya Galerisi" : "Construction Media Gallery"}
            description={
              locale === "tr"
                ? "Konut ve fabrika/sanayi projeleri ayrı gruplarda gösterilir."
                : "Residential and factory/industrial projects are displayed in separate groups."
            }
          />

          <div>
            <h3 className="font-display text-2xl text-navy-900">
              {locale === "tr" ? "Konut Projeleri" : "Residential Projects"}
            </h3>
            <div className="mt-4">
              {housingItems.length ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {housingItems.map((item) => (
                    <ProjectGalleryCard
                      key={item.projectId}
                      title={item.title}
                      categoryLabel={item.categoryLabel}
                      shortInfo={item.shortInfo}
                      location={item.location}
                      statusLabel={item.statusLabel}
                      description={item.description}
                      images={item.images}
                      carouselActive
                      carouselSpeed="normal"
                      onOpen={(index) => {
                        setSelectedItem(item);
                        setSelectedImageIndex(index);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <PlaceholderMedia
                  tone="construction"
                  label={locale === "tr" ? "Konut medya içeriği bekleniyor" : "Residential media pending"}
                  className="min-h-44"
                />
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-2xl text-navy-900">
              {locale === "tr" ? "Fabrika / Sanayi Projeleri" : "Factory / Industrial Projects"}
            </h3>
            <div className="mt-4">
              {factoryItems.length ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {factoryItems.map((item) => (
                    <ProjectGalleryCard
                      key={item.projectId}
                      title={item.title}
                      categoryLabel={item.categoryLabel}
                      shortInfo={item.shortInfo}
                      location={item.location}
                      statusLabel={item.statusLabel}
                      description={item.description}
                      images={item.images}
                      carouselActive
                      carouselSpeed="normal"
                      onOpen={(index) => {
                        setSelectedItem(item);
                        setSelectedImageIndex(index);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <PlaceholderMedia
                  tone="construction"
                  label={locale === "tr" ? "Fabrika medya içeriği bekleniyor" : "Factory media pending"}
                  className="min-h-44"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedItem ? (
        <MediaLightbox
          isOpen={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
          categoryLabel={selectedItem.categoryLabel}
          location={selectedItem.location}
          statusLabel={selectedItem.statusLabel}
          description={selectedItem.description}
          images={selectedItem.images}
          initialIndex={selectedImageIndex}
          videoUrl={selectedItem.videoUrl}
        />
      ) : null}

      <CtaBanner />
    </>
  );
}
