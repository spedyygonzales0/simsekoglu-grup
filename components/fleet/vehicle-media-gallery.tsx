"use client";

import { MediaCarousel } from "@/components/media/media-carousel";
import { CarouselSpeed } from "@/lib/types";

interface VehicleMediaGalleryProps {
  title: string;
  images: string[];
  carouselActive?: boolean;
  carouselSpeed?: CarouselSpeed;
}

export function VehicleMediaGallery({
  title,
  images,
  carouselActive = true,
  carouselSpeed = "normal"
}: VehicleMediaGalleryProps) {
  return (
    <MediaCarousel
      images={images}
      alt={title}
      className="rounded-none border-0"
      imageClassName="h-52"
      imageSizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      carouselActive={carouselActive}
      carouselSpeed={carouselSpeed}
      showControls={false}
      showIndicators={false}
    />
  );
}
