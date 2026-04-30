"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MediaTab = "photos" | "video";

interface ProjectDetailLayoutProps {
  locale: "tr" | "en";
  breadcrumb: React.ReactNode;
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  shortDescription: string;
  detailedDescription: string;
  categoryLabel: string;
  locationLabel?: string;
  statusLabel?: string;
  yearLabel?: string;
  images: string[];
  videoUrl?: string;
}

const PLACEHOLDER_IMAGE = "/images/general/placeholder-hero.svg";

export function ProjectDetailLayout({
  locale,
  breadcrumb,
  backHref,
  backLabel,
  title,
  subtitle,
  shortDescription,
  detailedDescription,
  categoryLabel,
  locationLabel,
  statusLabel,
  yearLabel,
  images,
  videoUrl
}: ProjectDetailLayoutProps) {
  const validImages = useMemo(() => {
    const unique = Array.from(new Set((images || []).filter(Boolean)));
    return unique.length ? unique : [PLACEHOLDER_IMAGE];
  }, [images]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<MediaTab>("photos");

  const hasVideo = Boolean(videoUrl);
  const selectedImage = validImages[selectedImageIndex] || validImages[0];

  const photoCount = validImages.filter((item) => item !== PLACEHOLDER_IMAGE).length;
  const videoCount = hasVideo ? 1 : 0;

  useEffect(() => {
    if (!hasVideo && activeTab === "video") {
      setActiveTab("photos");
    }
  }, [activeTab, hasVideo]);

  const goPrev = () => {
    if (validImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (validImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="section-spacing">
      <div className="container-wide">
        <div className="mx-auto max-w-[1380px] space-y-6">
          <nav className="small-note flex flex-wrap items-center gap-2 text-navy-900/70">{breadcrumb}</nav>

          <div className="grid items-start gap-6 lg:grid-cols-[1.28fr_0.72fr]">
            <div className="rounded-2xl border border-navy-900/12 bg-white p-4 shadow-[0_22px_55px_-28px_rgba(10,27,54,0.45)] sm:p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("photos")}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    activeTab === "photos"
                      ? "border-gold-500 bg-gold-50 text-navy-900"
                      : "border-navy-900/20 bg-white text-navy-900/80 hover:border-gold-500/60"
                  }`}
                >
                  {locale === "tr" ? "Fotoğraflar" : "Photos"}
                </button>
                {hasVideo ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("video")}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                      activeTab === "video"
                        ? "border-gold-500 bg-gold-50 text-navy-900"
                        : "border-navy-900/20 bg-white text-navy-900/80 hover:border-gold-500/60"
                    }`}
                  >
                    {locale === "tr" ? "Video" : "Video"}
                  </button>
                ) : null}
              </div>

              {activeTab === "photos" ? (
                <>
                  <div className="relative overflow-hidden rounded-2xl border border-navy-900/10 bg-slate-100/80 shadow-inner">
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src={selectedImage}
                        alt={title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 62vw"
                        className="object-cover"
                      />
                    </div>

                    {validImages.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={goPrev}
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/85 px-3 py-2 text-sm font-bold text-navy-900 shadow transition hover:bg-white"
                          aria-label={locale === "tr" ? "Önceki fotoğraf" : "Previous photo"}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/85 px-3 py-2 text-sm font-bold text-navy-900 shadow transition hover:bg-white"
                          aria-label={locale === "tr" ? "Sonraki fotoğraf" : "Next photo"}
                        >
                          ›
                        </button>
                      </>
                    ) : null}
                  </div>

                  {validImages.length > 1 ? (
                    <div className="mt-4 flex gap-2 overflow-x-auto rounded-xl border border-navy-900/10 bg-white/90 p-2">
                      {validImages.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border ${
                            selectedImageIndex === index ? "border-gold-500" : "border-navy-900/15"
                          }`}
                        >
                          <Image src={image} alt={`thumb-${index + 1}`} fill sizes="112px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-navy-900/10 bg-black shadow-inner">
                  <div className="relative aspect-video w-full">
                    {hasVideo ? (
                      <>
                        <video
                          key={videoUrl}
                          src={videoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          controls={false}
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                        <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/45 bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                          {locale === "tr" ? "Tanıtım Videosu" : "Promo Video"}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <aside className="self-start rounded-2xl border border-navy-900/10 bg-white p-6 shadow-soft">
              <h1 className="page-title !text-[2.5rem] leading-tight text-navy-900">{title}</h1>
              {subtitle ? <p className="mt-2 text-lg font-medium text-navy-900/72">{subtitle}</p> : null}

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                {photoCount > 0 ? (
                  <span className="rounded-full border border-navy-900/15 bg-cloud-50 px-3 py-1 text-navy-900/85">
                    {photoCount} {locale === "tr" ? "fotoğraf" : "photos"}
                  </span>
                ) : null}
                {videoCount > 0 ? (
                  <span className="rounded-full border border-navy-900/15 bg-cloud-50 px-3 py-1 text-navy-900/85">
                    {videoCount} {locale === "tr" ? "video" : "videos"}
                  </span>
                ) : null}
              </div>

              <p className="body-text mt-4 text-navy-900/84">{shortDescription}</p>
              {detailedDescription.trim() && detailedDescription.trim() !== shortDescription.trim() ? (
                <p className="body-text mt-4 whitespace-pre-line text-navy-900/82">{detailedDescription}</p>
              ) : null}

              <div className="mt-6 grid gap-3 rounded-xl border border-navy-900/10 bg-cloud-50 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-navy-900/72">{locale === "tr" ? "Kategori" : "Category"}</span>
                  <span className="text-right text-navy-900">{categoryLabel}</span>
                </div>
                {locationLabel ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-navy-900/72">{locale === "tr" ? "Konum" : "Location"}</span>
                    <span className="text-right text-navy-900">{locationLabel}</span>
                  </div>
                ) : null}
                {statusLabel ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-navy-900/72">{locale === "tr" ? "Durum" : "Status"}</span>
                    <span className="rounded-full border border-gold-500/40 bg-gold-50 px-2 py-0.5 text-xs font-semibold text-gold-700">
                      {statusLabel}
                    </span>
                  </div>
                ) : null}
                {yearLabel ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-navy-900/72">{locale === "tr" ? "Yıl" : "Year"}</span>
                    <span className="text-right text-navy-900">{yearLabel}</span>
                  </div>
                ) : null}
              </div>

              <Link
                href={backHref}
                className="mt-6 inline-flex rounded-xl border border-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-gold-500 hover:text-navy-950"
              >
                {backLabel}
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
