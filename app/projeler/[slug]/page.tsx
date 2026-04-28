"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { getSafeProjectGalleryImages, getSafeProjectVideo } from "@/lib/data/image-map";
import { projectMatchesSlug } from "@/lib/data/project-slug";
import { projectStatusLabel, serviceTypeLabel } from "@/lib/i18n";

const MediaLightbox = dynamic(
  () => import("@/components/media/media-lightbox").then((mod) => mod.MediaLightbox),
  { ssr: false }
);

function isVideoPath(path: string | undefined): boolean {
  if (!path) return false;
  return /\.(mp4|webm|ogg)$/i.test(path);
}

function formatProjectDate(value: string, locale: "tr" | "en"): string {
  if (!value) return "-";

  const [yearRaw, monthRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isFinite(year)) return value;
  if (!Number.isFinite(month) || month < 1 || month > 12) return `${year}`;

  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    month: "long",
    year: "numeric"
  }).format(date);
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { locale, content } = useSiteData();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const project = useMemo(
    () => content.projects.find((item) => projectMatchesSlug(item, slug)),
    [content.projects, slug]
  );

  const galleryImages = useMemo(
    () => (project ? getSafeProjectGalleryImages(project) : []),
    [project]
  );

  const videoUrl = project ? getSafeProjectVideo(project) : "";
  const hasMultipleImages = galleryImages.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [slug]);

  if (!project) {
    return (
      <section className="section-spacing">
        <div className="container-wide">
          <div className="rounded-2xl border border-dashed border-navy-900/20 bg-white p-8 text-center">
            <h1 className="font-display text-3xl text-navy-900">
              {locale === "tr" ? "Proje bulunamadı" : "Project not found"}
            </h1>
            <p className="mt-3 text-sm text-navy-900/65">
              {locale === "tr"
                ? "Aradığınız proje taşınmış veya kaldırılmış olabilir."
                : "The project you are looking for may have been moved or removed."}
            </p>
            <Link
              href="/projects"
              className="mt-5 inline-flex rounded-full border border-navy-900/20 px-5 py-2 text-sm font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
            >
              {locale === "tr" ? "Projelere Dön" : "Back to Projects"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const title = locale === "tr" ? project.titleTr : project.titleEn;
  const description = locale === "tr" ? project.descriptionTr : project.descriptionEn;
  const location = locale === "tr" ? project.locationTr : project.locationEn;

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  };

  return (
    <>
      <section className="section-spacing bg-white">
        <div className="container-wide space-y-7">
          <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-navy-900/55">
            <Link href="/" className="transition hover:text-gold-600">
              {locale === "tr" ? "Ana Sayfa" : "Home"}
            </Link>
            <span>/</span>
            <Link href="/projeler" className="transition hover:text-gold-600">
              {locale === "tr" ? "Projeler" : "Projects"}
            </Link>
            <span>/</span>
            <span className="text-navy-900">{title}</span>
          </nav>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-gold-600">
                {serviceTypeLabel(project.category, locale)}
              </p>
              <h1 className="mt-2 font-display text-4xl text-navy-900 sm:text-5xl">{title}</h1>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) router.back();
                else router.push("/projects");
              }}
              className="rounded-full border border-navy-900/20 px-5 py-2 text-sm font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
            >
              {locale === "tr" ? "Geri Dön" : "Go Back"}
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-navy-900/10 bg-cloud-50">
                {galleryImages[activeIndex] ? (
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="block h-full w-full"
                  >
                    <Image
                      src={galleryImages[activeIndex]}
                      alt={`${title} - ${activeIndex + 1}`}
                      width={1600}
                      height={1000}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 1100px"
                      className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[500px]"
                    />
                  </button>
                ) : (
                  <div className="flex h-[320px] items-center justify-center text-sm text-navy-900/60 sm:h-[420px] lg:h-[500px]">
                    {locale === "tr" ? "Görsel bulunamadı" : "No image available"}
                  </div>
                )}

                {hasMultipleImages ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-navy-900"
                      aria-label={locale === "tr" ? "Önceki görsel" : "Previous image"}
                    >
                      {"<"}
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-navy-900"
                      aria-label={locale === "tr" ? "Sonraki görsel" : "Next image"}
                    >
                      {">"}
                    </button>
                  </>
                ) : null}
              </div>

              {hasMultipleImages ? (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {galleryImages.map((imagePath, index) => (
                    <button
                      key={`${imagePath}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`overflow-hidden rounded-lg border ${
                        index === activeIndex ? "border-gold-500" : "border-navy-900/15"
                      }`}
                    >
                      <Image
                        src={imagePath}
                        alt={`${title} thumbnail ${index + 1}`}
                        width={260}
                        height={180}
                        sizes="(max-width: 640px) 22vw, 130px"
                        loading="lazy"
                        className="h-16 w-full object-cover sm:h-20"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <aside className="rounded-2xl border border-navy-900/10 bg-cloud-50 p-6">
              <h2 className="font-display text-2xl text-navy-900">
                {locale === "tr" ? "Proje Bilgileri" : "Project Information"}
              </h2>
              <div className="mt-5 space-y-4 text-sm text-navy-900/80">
                <p>
                  <strong>{locale === "tr" ? "Proje Adı:" : "Project Name:"}</strong> {title}
                </p>
                <p>
                  <strong>{locale === "tr" ? "Kategori:" : "Category:"}</strong>{" "}
                  {serviceTypeLabel(project.category, locale)}
                </p>
                <p>
                  <strong>{locale === "tr" ? "Konum:" : "Location:"}</strong> {location}
                </p>
                <p>
                  <strong>{locale === "tr" ? "Tarih:" : "Date:"}</strong>{" "}
                  {formatProjectDate(project.date, locale)}
                </p>
                <p>
                  <strong>{locale === "tr" ? "Durum:" : "Status:"}</strong>{" "}
                  {projectStatusLabel(project.status, locale)}
                </p>
                <p className="rounded-xl border border-navy-900/10 bg-white p-4 leading-relaxed">
                  <strong>{locale === "tr" ? "Açıklama:" : "Description:"}</strong>
                  <br />
                  {description}
                </p>
              </div>
            </aside>
          </div>

          <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
            <h2 className="font-display text-2xl text-navy-900">{locale === "tr" ? "Video" : "Video"}</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-navy-900/10 bg-cloud-50">
              {videoUrl ? (
                isVideoPath(videoUrl) ? (
                  <video controls preload="metadata" className="h-[240px] w-full bg-black sm:h-[360px]">
                    <source src={videoUrl} />
                  </video>
                ) : (
                  <Image
                    src={videoUrl}
                    alt={`${title} video placeholder`}
                    width={1400}
                    height={800}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
                    className="h-[240px] w-full object-cover sm:h-[360px]"
                  />
                )
              ) : (
                <div className="flex h-[240px] items-center justify-center text-sm text-navy-900/60 sm:h-[360px]">
                  {locale === "tr" ? "Video bulunamadı" : "No video available"}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <MediaLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={title}
        categoryLabel={serviceTypeLabel(project.category, locale)}
        location={location}
        statusLabel={projectStatusLabel(project.status, locale)}
        description={description}
        images={galleryImages}
        initialIndex={activeIndex}
        videoUrl={videoUrl}
      />
    </>
  );
}
