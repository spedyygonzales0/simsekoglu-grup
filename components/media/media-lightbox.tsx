"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categoryLabel?: string;
  location?: string;
  statusLabel?: string;
  description?: string;
  images: string[];
  initialIndex?: number;
  videoUrl?: string;
}

type MediaItem = {
  type: "image" | "video";
  src: string;
  thumbSrc: string;
  label: string;
};

function isVideoPath(path: string | undefined): boolean {
  if (!path) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(path);
}

export function MediaLightbox({
  isOpen,
  onClose,
  title,
  categoryLabel,
  location,
  statusLabel,
  description,
  images,
  initialIndex = 0,
  videoUrl
}: MediaLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const uniqueImages = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const safeVideoUrl = videoUrl || "";
  const hasVideo = isVideoPath(safeVideoUrl);

  const mediaItems = useMemo<MediaItem[]>(() => {
    const photoItems = uniqueImages.map((src, index) => ({
      type: "image" as const,
      src,
      thumbSrc: src,
      label: `Fotoğraf ${index + 1}`
    }));

    if (!hasVideo) return photoItems;

    const videoThumb = uniqueImages[0] || "/images/general/hero-placeholder.svg";
    const videoItem: MediaItem = {
      type: "video",
      src: safeVideoUrl,
      thumbSrc: videoThumb,
      label: "Video"
    };

    return [videoItem, ...photoItems];
  }, [hasVideo, safeVideoUrl, uniqueImages]);

  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = mediaItems.length > 1;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const normalizedIndex = hasVideo ? 0 : Math.min(initialIndex, mediaItems.length - 1);
    setActiveIndex(Math.max(0, normalizedIndex));
  }, [hasVideo, initialIndex, isOpen, mediaItems.length]);

  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (!hasMultiple) return;
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % mediaItems.length);
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, isOpen, mediaItems.length, onClose]);

  if (!mounted || !isOpen) return null;

  const activeItem = mediaItems[activeIndex];
  const metaLine = [location, statusLabel].filter(Boolean).join(" | ");

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[rgba(4,13,29,0.88)] p-0 backdrop-blur-[2px] sm:p-3 lg:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex h-[100dvh] w-full max-w-[1680px] flex-col overflow-hidden bg-white shadow-[0_35px_90px_-30px_rgba(0,0,0,0.7)] sm:h-[94dvh] sm:w-[95vw] sm:rounded-2xl sm:border sm:border-white/15"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-30 rounded-lg border border-navy-900/20 bg-white/96 px-3 py-1.5 text-sm font-semibold text-navy-900 shadow-sm transition hover:border-gold-500 hover:text-gold-600"
        >
          Kapat
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid min-h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="flex min-h-0 flex-col bg-[#0c1d35]">
              <div className="relative flex min-h-[280px] flex-1 items-center justify-center bg-[#071426] p-3 sm:min-h-[340px] lg:min-h-[520px] lg:p-4">
                {activeItem?.type === "video" ? (
                  <video
                    autoPlay
                    muted
                    loop
                    preload="metadata"
                    playsInline
                    key={activeItem.src}
                    className="max-h-full w-full rounded-xl border border-white/10 bg-black object-contain"
                  >
                    <source src={activeItem.src} />
                  </video>
                ) : activeItem?.src ? (
                  <Image
                    src={activeItem.src}
                    alt={`${title} - ${activeItem.label}`}
                    width={1800}
                    height={1200}
                    sizes="(max-width: 1024px) 95vw, 70vw"
                    className="max-h-full w-full rounded-xl border border-white/10 object-contain"
                  />
                ) : null}

                {hasMultiple ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/50 px-3 py-2 text-sm font-bold text-white transition hover:bg-black/70"
                      aria-label="Önceki medya"
                    >
                      {"<"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveIndex((prev) => (prev + 1) % mediaItems.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/50 px-3 py-2 text-sm font-bold text-white transition hover:bg-black/70"
                      aria-label="Sonraki medya"
                    >
                      {">"}
                    </button>
                  </>
                ) : null}
              </div>

              <div className="border-t border-white/10 bg-[#0a172b] p-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {mediaItems.map((item, index) => (
                    <button
                      key={`${item.type}-${item.src}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition sm:h-18 sm:w-28 ${
                        index === activeIndex ? "border-gold-400 ring-1 ring-gold-300/70" : "border-white/20"
                      }`}
                      aria-label={`${item.label} ${index + 1}`}
                    >
                      <Image src={item.thumbSrc} alt={`${title} thumbnail ${index + 1}`} fill sizes="96px" className="object-cover" />
                      {item.type === "video" ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">▶</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <aside className="min-h-0 border-t border-navy-900/10 bg-white lg:border-l lg:border-t-0">
              <div className="h-full overflow-y-auto px-4 pb-4 pt-14 sm:px-5 sm:pt-14">
                <div>
                  {categoryLabel ? (
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600">{categoryLabel}</p>
                  ) : null}
                  <h3 className="mt-1 text-xl font-extrabold leading-tight text-navy-900 sm:text-2xl">{title}</h3>
                  {metaLine ? <p className="mt-1 text-sm text-navy-900/70">{metaLine}</p> : null}
                </div>

                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-navy-900/12 bg-cloud-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy-900/65">Medya</p>
                    <p className="mt-1 text-sm font-semibold text-navy-900">
                      {activeIndex + 1} / {mediaItems.length} • {activeItem?.type === "video" ? "Video" : "Fotoğraf"}
                    </p>
                  </div>

                  {description ? <p className="text-base leading-7 text-navy-900/84">{description}</p> : null}

                  {hasVideo ? (
                    <div className="rounded-xl border border-gold-400/35 bg-gold-50 px-4 py-3">
                      <p className="text-sm font-semibold text-navy-900">Video mevcut</p>
                      <p className="mt-1 text-sm text-navy-900/72">Video sessiz önizleme olarak otomatik oynar.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
