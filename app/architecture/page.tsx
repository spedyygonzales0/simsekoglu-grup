"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { QuoteButton } from "@/components/shared/quote-button";
import { SectionTitle } from "@/components/shared/section-title";
import { getArchitecturePortfolioData } from "@/lib/services/architecture-service";
import { ArchitectureCategory } from "@/lib/types";

const ARCHITECTURE_PLACEHOLDER = "/images/architecture/project-placeholder-1.svg";

export default function ArchitecturePage() {
  const { locale } = useSiteData();
  const [categories, setCategories] = useState<ArchitectureCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await getArchitecturePortfolioData();
      if (!mounted) return;
      setCategories(data.categories.filter((item) => item.active));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  return (
    <section className="section-spacing">
      <div className="container-wide">
        <SectionTitle
          title={locale === "tr" ? "Mimarlık Kategorileri" : "Architecture Categories"}
          description={
            locale === "tr"
              ? "Mimarlık portföyümüzü proje türüne göre inceleyin."
              : "Explore our architecture portfolio by project type."
          }
        />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-[380px] animate-pulse rounded-2xl border border-navy-900/10 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedCategories.map((category) => (
              <article
                key={category.id}
                className="group overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={category.coverImageUrl || ARCHITECTURE_PLACEHOLDER}
                    alt={locale === "tr" ? category.titleTr : category.titleEn}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-navy-950/15 to-transparent" />
                </div>
                <div className="space-y-4 p-6">
                  <h2 className="card-title text-2xl text-navy-900">
                    {locale === "tr" ? category.titleTr : category.titleEn}
                  </h2>
                  <p className="body-text min-h-[72px] text-navy-900/78">
                    {locale === "tr" ? category.descriptionTr : category.descriptionEn}
                  </p>
                  <Link
                    href={`/architecture/${category.slug}`}
                    className="inline-flex rounded-xl border border-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-gold-500 hover:text-navy-950"
                  >
                    {locale === "tr" ? "Projeleri İncele" : "Explore Projects"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !sortedCategories.length ? (
          <div className="mt-6 rounded-xl border border-navy-900/15 bg-white px-6 py-10 text-center text-navy-900/70">
            {locale === "tr"
              ? "Henüz aktif mimarlık kategorisi bulunmuyor."
              : "There are no active architecture categories yet."}
          </div>
        ) : null}

        <div className="mt-10 flex justify-start">
          <QuoteButton
            serviceType="architecture"
            selectedLabel={locale === "tr" ? "Mimarlık Hizmeti Teklifi" : "Architecture Service Quote"}
            showFormButton={false}
          />
        </div>
      </div>
    </section>
  );
}
