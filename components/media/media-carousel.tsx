"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CarouselSpeed } from "@/lib/types";

interface MediaCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
  imageSizes?: string;
  carouselActive?: boolean;
  carouselSpeed?: CarouselSpeed;
  onOpen?: (index: number) => void;
  showControls?: boolean;
  showIndicators?: boolean;
}

const SPEED_MS: Record<CarouselSpeed, number> = {
  slow: 5000,
  normal: 4000,
  fast: 3000
};

export function MediaCarousel({
  images,
  alt,
  className = "",
  imageClassName = "h-56",
  imageSizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  carouselActive = true,
  carouselSpeed = "normal",
  onOpen,
  showControls = true,
  showIndicators = true
}: MediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const uniqueImages = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const imagesKey = useMemo(() => uniqueImages.join("|"), [uniqueImages]);
  const hasMultiple = uniqueImages.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [imagesKey]);

  useEffect(() => {
    if (!carouselActive || !hasMultiple || isHovered) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % uniqueImages.length);
    }, SPEED_MS[carouselSpeed]);

    return () => window.clearInterval(timer);
  }, [carouselActive, carouselSpeed, hasMultiple, isHovered, uniqueImages.length]);

  const activeImage = uniqueImages[activeIndex];

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % uniqueImages.length);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-navy-900/10 bg-cloud-50 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {activeImage ? (
        onOpen ? (
          <button
            type="button"
            onClick={() => onOpen(activeIndex)}
            className={`block w-full overflow-hidden text-left ${imageClassName}`}
          >
            <Image
              src={activeImage}
              alt={alt}
              width={1200}
              height={800}
              sizes={imageSizes}
              loading="lazy"
              className={`h-full w-full object-cover transition duration-500 ${
                hasMultiple ? "hover:scale-[1.02]" : ""
              }`}
            />
          </button>
        ) : (
          <div className={`block w-full overflow-hidden ${imageClassName}`}>
            <Image
              src={activeImage}
              alt={alt}
              width={1200}
              height={800}
              sizes={imageSizes}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500"
            />
          </div>
        )
      ) : (
        <div className={`flex items-center justify-center ${imageClassName}`}>
          <span className="text-sm text-navy-900/55">Gorsel yok</span>
        </div>
      )}

      {hasMultiple ? (
        <>
          {showControls ? (
            <>
              <button
                type="button"
                aria-label="Onceki gorsel"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-2 py-1 text-xs font-bold text-navy-900 shadow"
              >
                {"<"}
              </button>
              <button
                type="button"
                aria-label="Sonraki gorsel"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-2 py-1 text-xs font-bold text-navy-900 shadow"
              >
                {">"}
              </button>
            </>
          ) : null}

          {showIndicators ? (
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2 py-1">
              {uniqueImages.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    index === activeIndex ? "bg-gold-400" : "bg-white/80"
                  }`}
                  aria-label={`Gorsel ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
