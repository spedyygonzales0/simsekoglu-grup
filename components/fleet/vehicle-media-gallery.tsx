"use client";

import { MediaCarousel } from "@/components/media/media-carousel";
import { CarouselSpeed } from "@/lib/types";

interface VehicleMediaGalleryProps {
  title: string;
  images: string[];
  carouselActive?: boolean;
  carouselSpeed?: CarouselSpeed;
  onOpen?: (index: number) => void;
}

export function VehicleMediaGallery({
  title,
  images,
  carouselActive = true,
  carouselSpeed = "normal",
  onOpen
}: VehicleMediaGalleryProps) {
  return (
    <MediaCarousel
      images={images}
      alt={title}
      className="rounded-none border-0 bg-cloud-100"
      imageClassName="h-56 sm:h-60"
      imageSizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      carouselActive={carouselActive}
      carouselSpeed={carouselSpeed}
      onOpen={onOpen}
      showControls={images.length > 1}
      showIndicators={images.length > 1}
      imageFit="contain"
    />
  );
}
