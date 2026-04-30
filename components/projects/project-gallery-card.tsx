"use client";

import Link from "next/link";
import { MediaCarousel } from "@/components/media/media-carousel";
import { RevealOnScroll } from "@/components/shared/reveal-on-scroll";
import { CarouselSpeed } from "@/lib/types";

interface ProjectGalleryCardProps {
  title: string;
  categoryLabel: string;
  shortInfo: string;
  location?: string;
  statusLabel?: string;
  description?: string;
  images: string[];
  carouselActive?: boolean;
  carouselSpeed?: CarouselSpeed;
  videoUrl?: string;
  detailHref?: string;
  detailLabel?: string;
  onOpen?: (index: number) => void;
}

export function ProjectGalleryCard({
  title,
  categoryLabel,
  shortInfo,
  location,
  statusLabel,
  images,
  carouselActive = true,
  carouselSpeed = "normal",
  videoUrl,
  detailHref,
  detailLabel = "Detayları Gör",
  onOpen
}: ProjectGalleryCardProps) {
  const normalizedImages = Array.from(new Set(images.filter(Boolean)));
  const photoCount = normalizedImages.length;
  const hasVideo = Boolean(videoUrl && /\.(mp4|webm|ogg|mov)$/i.test(videoUrl));
  const previewImage = normalizedImages[0];

  return (
    <RevealOnScroll>
      <article className="premium-card group overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-soft">
        <div className="relative rounded-none border-0 border-b border-navy-900/10">
          {hasVideo ? (
            <button
              type="button"
              onClick={() => onOpen?.(0)}
              className="group/preview relative block h-64 w-full overflow-hidden bg-navy-900 text-left sm:h-72 lg:h-80"
            >
              <video
                className="h-full w-full object-cover"
                src={videoUrl}
                poster={previewImage}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 transition group-hover/preview:from-black/30" />
            </button>
          ) : (
            <MediaCarousel
              images={normalizedImages}
              alt={title}
              className="rounded-none border-0"
              imageClassName="h-52 sm:h-72 lg:h-80"
              imageSizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              carouselActive={carouselActive}
              carouselSpeed={carouselSpeed}
              onOpen={onOpen}
            />
          )}

          <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
            {hasVideo ? (
              <span className="rounded-full border border-gold-300/60 bg-gold-500/90 px-2.5 py-1 text-xs font-bold text-navy-900">
                Video var
              </span>
            ) : null}
            <span className="rounded-full border border-white/50 bg-white/90 px-2.5 py-1 text-xs font-bold text-navy-900">
              Fotoğraf: {photoCount}
            </span>
          </div>
        </div>

        <div className="space-y-3 p-5">
          <span className="inline-flex rounded-full border border-navy-900/15 bg-cloud-50 px-3 py-1 text-sm font-semibold text-navy-900/80">
            {categoryLabel}
          </span>
          <h3 className="card-title text-[1.55rem]">{title}</h3>
          <p className="body-text line-clamp-2 text-navy-900/70">{shortInfo}</p>
          <p className="small-note font-medium tracking-[0.03em] text-navy-900/72">
            {[location, statusLabel].filter(Boolean).join(" | ") || "-"}
          </p>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            {detailHref ? (
              <Link
                href={detailHref}
                className="premium-btn rounded-full border border-navy-900/25 px-4 py-2.5 text-center text-base font-semibold text-navy-900 hover:border-gold-500 hover:text-gold-500"
              >
                {detailLabel}
              </Link>
            ) : null}
            {onOpen ? (
              <button
                type="button"
                onClick={() => onOpen(0)}
                className="premium-btn rounded-full border border-navy-900/20 px-4 py-2.5 text-center text-base font-semibold text-navy-900/80 hover:border-gold-500 hover:text-gold-500"
              >
                Galeriyi Aç
              </button>
            ) : null}
          </div>
        </div>
      </article>
    </RevealOnScroll>
  );
}
