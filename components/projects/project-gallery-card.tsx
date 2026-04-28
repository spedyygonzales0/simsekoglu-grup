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
  detailHref,
  detailLabel = "Detayları Gör",
  onOpen
}: ProjectGalleryCardProps) {
  return (
    <RevealOnScroll>
      <article className="premium-card group overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-soft">
        <MediaCarousel
          images={images}
          alt={title}
          className="rounded-none border-0 border-b border-navy-900/10"
          imageClassName="h-56"
          imageSizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          carouselActive={carouselActive}
          carouselSpeed={carouselSpeed}
          onOpen={onOpen}
        />

        <div className="space-y-3 p-5">
          <span className="inline-flex rounded-full border border-navy-900/15 bg-cloud-50 px-3 py-1 text-xs font-semibold text-navy-900/80">
            {categoryLabel}
          </span>
          <h3 className="font-display text-xl text-navy-900">{title}</h3>
          <p className="line-clamp-2 text-sm text-navy-900/70">{shortInfo}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-navy-900/55">
            {[location, statusLabel].filter(Boolean).join(" | ") || "-"}
          </p>

          <div className="flex items-center gap-2">
            {detailHref ? (
              <Link
                href={detailHref}
                className="premium-btn rounded-full border border-navy-900/25 px-4 py-2 text-xs font-semibold text-navy-900 hover:border-gold-500 hover:text-gold-500"
              >
                {detailLabel}
              </Link>
            ) : null}
            {onOpen ? (
              <button
                type="button"
                onClick={() => onOpen(0)}
                className="premium-btn rounded-full border border-navy-900/20 px-4 py-2 text-xs font-semibold text-navy-900/80 hover:border-gold-500 hover:text-gold-500"
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
