"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { ProjectCard } from "@/components/projects/project-card";
import { useSiteData } from "@/components/providers/site-data-provider";
import { CtaBanner } from "@/components/shared/cta-banner";
import { RevealOnScroll } from "@/components/shared/reveal-on-scroll";
import { SectionTitle } from "@/components/shared/section-title";
import { t } from "@/lib/i18n";

type StatIconType = "experience" | "projects" | "fleet" | "satisfaction";

interface TrustStatItem {
  key: StatIconType;
  value: number;
  prefix?: string;
  suffix?: string;
  labelTr: string;
  labelEn: string;
}

function TrustStatIcon({ type }: { type: StatIconType }) {
  const commonProps = {
    className: "h-5 w-5 text-gold-500",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.8
  };

  if (type === "experience") {
    return (
      <svg {...commonProps}>
        <path d="M12 6v6l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    );
  }

  if (type === "projects") {
    return (
      <svg {...commonProps}>
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M8 10h8M8 14h5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "fleet") {
    return (
      <svg {...commonProps}>
        <path d="M4 14h16l-1.2-4.2a2 2 0 0 0-1.9-1.4H7.1a2 2 0 0 0-1.9 1.4L4 14Z" />
        <circle cx="8" cy="16.5" r="1.7" />
        <circle cx="16" cy="16.5" r="1.7" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 20s7-3.8 7-9.3V6.8L12 4 5 6.8v3.9C5 16.2 12 20 12 20Z" />
      <path d="m9.5 12 1.7 1.7 3.3-3.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnimatedStatValue({
  start,
  value,
  prefix = "",
  suffix = ""
}: {
  start: boolean;
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    const durationMs = 1200;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (time: number) => {
      const progress = Math.min((time - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(rafId);
  }, [start, value]);

  return (
    <p className="mt-4 font-display text-4xl font-semibold leading-none text-navy-900">
      {prefix}
      {displayValue}
      {suffix}
    </p>
  );
}

export function HomePage() {
  const { locale, content } = useSiteData();
  const heroFallbackImages = ["/images/general/hero-placeholder.svg", "/images/general/about-placeholder.svg"];
  const [activeSlide, setActiveSlide] = useState(0);
  const activeHeroImage = heroFallbackImages[activeSlide] || heroFallbackImages[0];
  const [isVideoAvailable, setIsVideoAvailable] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [statsInView, setStatsInView] = useState(false);
  const statsSectionRef = useRef<HTMLElement | null>(null);

  const showVideoBackground = !isMobile && isVideoAvailable;
  const showFallbackSlider = !showVideoBackground && !isMobile;

  const featuredProjects = useMemo(
    () => content.projects.filter((project) => project.featured).slice(0, 3),
    [content.projects]
  );

  const featuredVehicles = useMemo(
    () => content.vehicles.filter((vehicle) => vehicle.featured && vehicle.active).slice(0, 3),
    [content.vehicles]
  );

  const trustStats: TrustStatItem[] = [
    {
      key: "experience",
      value: 10,
      suffix: "+",
      labelTr: "Yıl Deneyim",
      labelEn: "Years Experience"
    },
    {
      key: "projects",
      value: 50,
      suffix: "+",
      labelTr: "Proje",
      labelEn: "Projects"
    },
    {
      key: "fleet",
      value: 100,
      suffix: "+",
      labelTr: "Araç Filosu",
      labelEn: "Fleet Vehicles"
    },
    {
      key: "satisfaction",
      value: 100,
      prefix: "%",
      labelTr: "Müşteri Memnuniyeti",
      labelEn: "Client Satisfaction"
    }
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncMobile = () => setIsMobile(mediaQuery.matches);
    syncMobile();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (prefersReducedMotion || connection?.saveData) {
      setIsVideoAvailable(false);
    }

    mediaQuery.addEventListener("change", syncMobile);
    return () => mediaQuery.removeEventListener("change", syncMobile);
  }, []);

  useEffect(() => {
    const section = statsSectionRef.current;
    if (!section || statsInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStatsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [statsInView]);

  useEffect(() => {
    if (!showFallbackSlider) return;

    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroFallbackImages.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [heroFallbackImages.length, showFallbackSlider]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMobile) {
      setParallaxOffset(0);
      return;
    }

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        setParallaxOffset(Math.min(window.scrollY * 0.18, 120));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isMobile]);

  const businessCards = [
    {
      title: locale === "tr" ? "İnşaat" : "Construction",
      description: locale === "tr" ? content.construction.descriptionTr : content.construction.descriptionEn,
      href: "/construction"
    },
    {
      title: locale === "tr" ? "Mimarlık" : "Architecture",
      description: locale === "tr" ? content.architecture.descriptionTr : content.architecture.descriptionEn,
      href: "/architecture"
    },
    {
      title: locale === "tr" ? "Araç Kiralama" : "Fleet Rental",
      description:
        locale === "tr"
          ? "Aylık kurumsal kiralama modeliyle güçlü ve prestijli araç portföyü."
          : "Strong and prestigious vehicle portfolio with monthly corporate rentals.",
      href: "/fleet-rental"
    }
  ];

  return (
    <>
      <section className="premium-gradient relative overflow-hidden py-24 sm:py-28">
        <div
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        >
          {showVideoBackground ? (
            <video
              key="hero-video"
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster={heroFallbackImages[0]}
              onError={() => setIsVideoAvailable(false)}
            >
              {/* Replace with real hero video files when ready */}
              <source src="/images/general/hero-video.webm" type="video/webm" />
              <source src="/images/general/hero-video.mp4" type="video/mp4" />
            </video>
          ) : (
            <div className="absolute inset-0">
              {showFallbackSlider ? (
                <Image
                  key={activeHeroImage}
                  src={activeHeroImage}
                  alt="Hero fallback"
                  fill
                  sizes="100vw"
                  className="object-cover transition-opacity duration-700"
                  priority
                />
              ) : (
                <Image
                  src={heroFallbackImages[0]}
                  alt="Hero fallback mobile"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              )}
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-navy-900/65" />
        <div className="absolute inset-0 opacity-35 [background:radial-gradient(circle_at_15%_15%,rgba(216,177,106,0.45),transparent_24%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.15),transparent_22%)]" />
        <div className="container-wide relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="hero-fade-up text-xs uppercase tracking-[0.2em] text-gold-300">simsekoglugrup.com</p>
            <h1 className="hero-fade-up hero-fade-delay-1 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              {locale === "tr" ? content.home.headlineTr : content.home.headlineEn}
            </h1>
            <p className="hero-fade-up hero-fade-delay-2 max-w-2xl text-lg text-white/80">
              {locale === "tr" ? content.home.subHeadlineTr : content.home.subHeadlineEn}
            </p>
            <div className="hero-fade-up hero-fade-delay-3 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="premium-btn rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 shadow-lg hover:bg-gold-400"
              >
                {locale === "tr" ? "Teklif Al" : "Get a Quote"}
              </Link>
              <Link
                href="/projects"
                className="premium-btn rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-navy-900"
              >
                {locale === "tr" ? "Projeleri İncele" : "Explore Projects"}
              </Link>
            </div>
            {showFallbackSlider ? (
              <div className="hero-fade-up hero-fade-delay-3 mt-4 flex items-center gap-2">
                {heroFallbackImages.map((item, index) => (
                  <span
                    key={item}
                    className={`h-1.5 w-6 rounded-full transition ${
                      index === activeSlide ? "bg-gold-400" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="hero-fade-up hero-fade-delay-2 glass-card p-6">
            <div className="relative min-h-72 overflow-hidden rounded-2xl border border-gold-500/30 bg-navy-900/40">
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 to-transparent" />
              <div className="absolute left-6 top-6 rounded-xl bg-white/90 p-3">
                {/* Replace with real logo file when available */}
                <Image
                  src="/images/general/logo.png"
                  alt="Şimşekoğlu Grup Logo"
                  width={64}
                  height={64}
                  className="h-14 w-14 object-contain"
                />
              </div>
              <div className="absolute inset-x-6 bottom-6 rounded-xl border border-white/15 bg-navy-900/55 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-gold-300">
                  {locale === "tr" ? "Kurumsal Güven" : "Corporate Trust"}
                </p>
                <p className="mt-2 text-sm text-white/85">
                  {locale === "tr"
                    ? "İnşaat, mimarlık ve filo yönetiminde sürdürülebilir premium standart."
                    : "Sustainable premium standards in construction, architecture, and fleet management."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-wide">
          <SectionTitle
            eyebrow={t(locale, "businessAreas")}
            title={locale === "tr" ? content.home.serviceTitleTr : content.home.serviceTitleEn}
            description={
              locale === "tr" ? content.home.serviceDescriptionTr : content.home.serviceDescriptionEn
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {businessCards.map((card) => (
              <RevealOnScroll key={card.href}>
                <Link
                  href={card.href}
                  className="premium-card group block overflow-hidden rounded-2xl border border-navy-900/10 bg-white p-6 shadow-soft hover:border-gold-500/40"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-gold-500">Şimşekoğlu Grup</p>
                  <h3 className="mt-3 font-display text-2xl text-navy-900">{card.title}</h3>
                  <p className="mt-2 text-sm text-navy-900/70">{card.description}</p>
                  <p className="mt-5 text-sm font-semibold text-navy-900 group-hover:text-gold-500">
                    {locale === "tr" ? "Detayı Gör" : "Explore"} →
                  </p>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section ref={statsSectionRef} className="bg-white py-16 sm:py-20">
        <div className="container-wide">
          <SectionTitle
            eyebrow={locale === "tr" ? "Kurumsal Ölçek" : "Corporate Scale"}
            title={locale === "tr" ? "Güven Veren Operasyon Gücü" : "Operational Scale You Can Trust"}
            description={
              locale === "tr"
                ? "Kurumsal çözümlerimizle uzun vadeli iş ortaklıkları kuruyoruz."
                : "We build long-term business partnerships with our corporate solutions."
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustStats.map((stat) => (
              <RevealOnScroll key={stat.key}>
                <div className="premium-card rounded-2xl border border-navy-900/10 bg-white p-6 shadow-soft">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/35 bg-gold-50">
                    <TrustStatIcon type={stat.key} />
                  </div>
                  <AnimatedStatValue
                    start={statsInView}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                  <p className="mt-2 text-sm font-medium text-navy-900/65">
                    {locale === "tr" ? stat.labelTr : stat.labelEn}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-wide">
          <SectionTitle
            title={t(locale, "featuredProjects")}
            rightSlot={
              <Link className="gold-link text-sm font-semibold" href="/projects">
                {locale === "tr" ? "Tüm Projeler" : "All Projects"}
              </Link>
            }
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-wide">
          <SectionTitle
            title={t(locale, "featuredVehicles")}
            rightSlot={
              <Link className="gold-link text-sm font-semibold" href="/fleet-rental">
                {locale === "tr" ? "Filo Detayı" : "Fleet Details"}
              </Link>
            }
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredVehicles.length ? (
              featuredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-navy-900/20 bg-cloud-50 p-8 text-sm text-navy-900/60">
                {locale === "tr" ? "Öne çıkarılmış aktif araç bulunmuyor." : "There are no active featured vehicles."}
              </div>
            )}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
