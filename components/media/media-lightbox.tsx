"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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

function isVideoPath(path: string | undefined): boolean {
  if (!path) return false;
  return /\.(mp4|webm|ogg)$/i.test(path);
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
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const uniqueImages = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const hasMultiple = uniqueImages.length > 1;

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (!hasMultiple) return;
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % uniqueImages.length);
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, isOpen, onClose, uniqueImages.length]);

  if (!isOpen) return null;

  const activeImage = uniqueImages[activeIndex];
  const showVideo = isVideoPath(videoUrl);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-900/75 p-3 sm:p-6">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {categoryLabel ? (
              <p className="text-xs uppercase tracking-[0.14em] text-gold-600">{categoryLabel}</p>
            ) : null}
            <h3 className="mt-1 font-display text-2xl text-navy-900 sm:text-3xl">{title}</h3>
            <p className="mt-2 text-sm text-navy-900/70">{[location, statusLabel].filter(Boolean).join(" | ") || "-"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-navy-900/20 px-3 py-1.5 text-sm font-semibold text-navy-900"
          >
            Kapat
          </button>
        </div>

        {activeImage ? (
          <div className="relative overflow-hidden rounded-xl border border-navy-900/10 bg-cloud-50">
            <Image
              src={activeImage}
              alt={title}
              width={1600}
              height={1000}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              className="h-[280px] w-full object-cover sm:h-[420px] lg:h-[520px]"
            />
            {hasMultiple ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-navy-900"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % uniqueImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-navy-900"
                >
                  {">"}
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {hasMultiple ? (
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {uniqueImages.map((imagePath, index) => (
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
                  width={240}
                  height={180}
                  sizes="(max-width: 640px) 20vw, 120px"
                  loading="lazy"
                  className="h-16 w-full object-cover sm:h-20"
                />
              </button>
            ))}
          </div>
        ) : null}

        {description ? <p className="mt-4 text-sm text-navy-900/75">{description}</p> : null}

        {videoUrl ? (
          <div className="mt-5 rounded-xl border border-navy-900/10 bg-cloud-50 p-3">
            <p className="mb-2 text-xs uppercase tracking-[0.12em] text-navy-900/60">Video</p>
            {showVideo ? (
              <video controls preload="metadata" className="h-[220px] w-full rounded-lg bg-black sm:h-[320px]">
                <source src={videoUrl} />
              </video>
            ) : (
              <Image
                src={videoUrl}
                alt={`${title} video placeholder`}
                width={1200}
                height={700}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1100px"
                className="h-[220px] w-full rounded-lg object-cover sm:h-[320px]"
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
