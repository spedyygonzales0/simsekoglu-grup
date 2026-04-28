"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";

type LandingPanelId = "construction" | "architecture" | "fleet";

interface LandingPanelItem {
  id: LandingPanelId;
  href: string;
  titleTr: string;
  titleEn: string;
  buttonTr: string;
  buttonEn: string;
  subtitleTr: string;
  subtitleEn: string;
  image: string;
  fallback: string;
}

function LandingPanelCard({
  panel,
  isActive,
  isDimmed,
  showDivider,
  locale,
  onHover,
  onLeave
}: {
  panel: LandingPanelItem;
  isActive: boolean;
  isDimmed: boolean;
  showDivider: boolean;
  locale: "tr" | "en";
  onHover: () => void;
  onLeave: () => void;
}) {
  const [imageSrc, setImageSrc] = useState(panel.image);

  useEffect(() => {
    setImageSrc(panel.image);
  }, [panel.image]);

  return (
    <Link
      href={panel.href}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group relative isolate h-[33.33vh] min-h-[200px] overflow-hidden border-2 border-white/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.24),0_26px_52px_-28px_rgba(7,20,39,0.98)] transition-[flex-grow,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:h-full lg:min-h-0 ${
        isActive ? "lg:flex-[2.15]" : isDimmed ? "lg:flex-[0.92]" : "lg:flex-1"
      }`}
    >
      <Image
        src={imageSrc}
        alt={locale === "tr" ? panel.titleTr : panel.titleEn}
        fill
        priority={panel.id === "construction"}
        sizes="(max-width: 1024px) 100vw, 33vw"
        className={`object-cover transition-transform duration-700 ease-out ${isActive ? "scale-[1.08]" : "scale-100"}`}
        onError={() => setImageSrc(panel.fallback)}
      />

      <div className={`absolute inset-0 transition-colors duration-700 ${isActive ? "bg-navy-900/50" : "bg-navy-900/68"}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(216,177,106,0.22),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.03)_34%,rgba(255,255,255,0)_62%)] opacity-55 transition-opacity duration-700 group-hover:opacity-80" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-gradient-to-r from-black/65 via-black/30 to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-black/65 via-black/30 to-transparent lg:block" />
      {showDivider ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 -right-1 z-20 hidden w-[4px] bg-gradient-to-b from-white via-gold-300/85 to-white lg:block" />
          <div className="pointer-events-none absolute inset-y-0 -right-3 z-10 hidden w-8 bg-gradient-to-l from-black/75 via-black/35 to-transparent lg:block" />
        </>
      ) : null}
      <div className="pointer-events-none absolute inset-0 ring-2 ring-white/45" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gold-300/90 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-7 pt-10 sm:px-8 sm:pb-9">
        <p
          className={`mb-4 max-w-md text-sm leading-relaxed text-white/90 transition-all duration-500 lg:translate-y-2 lg:opacity-0 ${
            isActive ? "lg:translate-y-0 lg:opacity-100" : ""
          }`}
        >
          {locale === "tr" ? panel.subtitleTr : panel.subtitleEn}
        </p>
        <h2
          className={`font-extrabold uppercase tracking-[0.04em] text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)] transition-all duration-500 sm:text-5xl ${
            isDimmed ? "text-[2.15rem] lg:text-[2rem] lg:opacity-90" : "text-4xl lg:text-[2.65rem]"
          }`}
        >
          {locale === "tr" ? panel.titleTr : panel.titleEn}
        </h2>

        <span
          className={`premium-btn mt-5 inline-flex w-fit rounded-full border border-gold-400/90 bg-transparent px-6 py-3 text-base font-semibold text-gold-300 transition-all duration-500 ${
            isActive ? "opacity-100" : "opacity-90"
          } group-hover:bg-gold-500 group-hover:text-navy-900`}
        >
          {locale === "tr" ? panel.buttonTr : panel.buttonEn}
        </span>
      </div>
    </Link>
  );
}

export function HomePage() {
  const { locale } = useSiteData();
  const [hoveredPanel, setHoveredPanel] = useState<LandingPanelId | null>(null);
  const constructionImages = useMemo(
    () => [
      "/images/construction/projects/KNT-001/photos/1.JPG",
      "/images/construction/projects/KNT-001/photos/2.JPG",
      "/images/construction/projects/KNT-002/photos/1.JPG",
      "/images/construction/projects/KNT-002/photos/2.JPG",
      "/images/construction/projects/KNT-003/photos/1.JPG",
      "/images/construction/projects/KNT-004/photos/1.JPG",
      "/images/construction/projects/KNT-005/photos/1.JPG",
      "/images/construction/projects/KNT-006/photos/1.JPG",
      "/images/construction/projects/FBK-001/photos/1.JPG",
      "/images/construction/projects/FBK-002/photos/1.JPG"
    ],
    []
  );
  const [constructionImageIndex, setConstructionImageIndex] = useState(0);

  useEffect(() => {
    if (constructionImages.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setConstructionImageIndex((current) => (current + 1) % constructionImages.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [constructionImages]);

  const panels: LandingPanelItem[] = useMemo(
    () => [
      {
        id: "construction",
        href: "/construction",
        titleTr: "İnşaat",
        titleEn: "Construction",
        buttonTr: "Projeleri Gör",
        buttonEn: "View Projects",
        subtitleTr: "Konut, fabrika ve ticari yapılarda anahtar teslim operasyon gücü.",
        subtitleEn: "Turnkey operational power in residential, factory, and commercial projects.",
        image: constructionImages[constructionImageIndex] ?? "/images/construction/project-placeholder-1.svg",
        fallback: "/images/construction/project-placeholder-1.svg"
      },
      {
        id: "architecture",
        href: "/architecture",
        titleTr: "Mimarlık",
        titleEn: "Architecture",
        buttonTr: "Tasarımı Keşfet",
        buttonEn: "Explore Design",
        subtitleTr: "Konseptten uygulama detayına uzanan kurumsal mimari yaklaşım.",
        subtitleEn: "Corporate architectural approach from concept to implementation details.",
        image: "/images/architecture/project-placeholder-1.svg",
        fallback: "/images/general/about-placeholder.svg"
      },
      {
        id: "fleet",
        href: "/fleet-rental",
        titleTr: "Filo Kiralama",
        titleEn: "Fleet Rental",
        buttonTr: "Araçları İncele",
        buttonEn: "Browse Vehicles",
        subtitleTr: "Kurumsal operasyonlara uygun güçlü, seçkin ve sürdürülebilir araç portföyü.",
        subtitleEn: "Strong, premium, and sustainable vehicle portfolio for corporate operations.",
        image: "/images/fleet/filo-ana.png",
        fallback: "/images/fleet/vehicle-placeholder.svg"
      }
    ],
    [constructionImageIndex, constructionImages]
  );

  return (
    <section className="landing-panel-grid premium-gradient relative isolate h-[calc(100dvh-5rem)] overflow-hidden">
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_8%,rgba(216,177,106,0.22),transparent_40%),radial-gradient(circle_at_82%_10%,rgba(255,255,255,0.12),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 via-white/0 to-transparent" />

      <div className="relative z-10 flex h-full flex-col gap-2 bg-white/25 p-2 lg:flex-row">
        {panels.map((panel, index) => (
          <LandingPanelCard
            key={panel.id}
            panel={panel}
            showDivider={index < panels.length - 1}
            locale={locale}
            isActive={hoveredPanel === panel.id}
            isDimmed={hoveredPanel !== null && hoveredPanel !== panel.id}
            onHover={() => setHoveredPanel(panel.id)}
            onLeave={() => setHoveredPanel(null)}
          />
        ))}
      </div>
    </section>
  );
}
