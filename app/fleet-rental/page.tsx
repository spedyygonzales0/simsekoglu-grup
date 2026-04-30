"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { useSiteData } from "@/components/providers/site-data-provider";
import { CtaBanner } from "@/components/shared/cta-banner";
import { SectionTitle } from "@/components/shared/section-title";
import { t, vehicleCategoryLabel } from "@/lib/i18n";
import { Vehicle, VehicleCategory } from "@/lib/types";

type FleetCategoryFilter = "all" | "suv" | "sedan" | "hatchback" | "commercial" | "luxury" | "electric";
type FleetSortOption = "default" | "price-asc" | "price-desc";

const CATEGORY_OPTIONS: FleetCategoryFilter[] = [
  "all",
  "suv",
  "sedan",
  "hatchback",
  "commercial",
  "luxury",
  "electric"
];

const CATEGORY_CHIPS: Array<{
  id: FleetCategoryFilter;
  icon: string;
  labelTr: string;
  labelEn: string;
}> = [
  { id: "all", icon: "T\u00dcM", labelTr: "T\u00fcm Ara\u00e7lar", labelEn: "All Vehicles" },
  { id: "suv", icon: "SUV", labelTr: "SUV", labelEn: "SUV" },
  { id: "sedan", icon: "SED", labelTr: "Sedan", labelEn: "Sedan" },
  { id: "hatchback", icon: "HB", labelTr: "Hatchback", labelEn: "Hatchback" },
  { id: "commercial", icon: "T\u0130C", labelTr: "Ticari", labelEn: "Commercial" },
  { id: "luxury", icon: "L\u00dcKS", labelTr: "L\u00fcks", labelEn: "Luxury" },
  { id: "electric", icon: "EV", labelTr: "Elektrikli", labelEn: "Electric" }
];

function getVehicleMinPrice(vehicle: Vehicle): number {
  const prices = (vehicle.rentalPackages || [])
    .flatMap((pkg) => [pkg.prices[1000], pkg.prices[2000], pkg.prices[3000]])
    .filter((price): price is number => typeof price === "number" && Number.isFinite(price) && price > 0);

  if (!prices.length) return Number.MAX_SAFE_INTEGER;
  return Math.min(...prices);
}

function sortVehicles(vehicles: Vehicle[], sortOption: FleetSortOption): Vehicle[] {
  if (sortOption === "default") return vehicles;

  const priced = vehicles.filter((vehicle) => getVehicleMinPrice(vehicle) !== Number.MAX_SAFE_INTEGER);
  const noPrice = vehicles.filter((vehicle) => getVehicleMinPrice(vehicle) === Number.MAX_SAFE_INTEGER);
  const sorted = [...priced].sort((a, b) => {
    const diff = getVehicleMinPrice(a) - getVehicleMinPrice(b);
    return sortOption === "price-asc" ? diff : -diff;
  });

  return [...sorted, ...noPrice];
}

function vehicleMatchesCategory(vehicle: Vehicle, category: FleetCategoryFilter): boolean {
  if (category === "all") return true;

  const hasCategory =
    vehicle.primaryCategory === category || vehicle.secondaryCategories.some((item) => item === category);
  if (hasCategory) return true;

  if (category === "electric") {
    return (vehicle.rentalPackages || []).some((pkg) => pkg.fuelType === "Elektrikli");
  }

  return false;
}

export default function FleetRentalPage() {
  const { locale, content } = useSiteData();

  const activeVehicles = useMemo(() => content.vehicles.filter((vehicle) => vehicle.active), [content.vehicles]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FleetCategoryFilter>("all");
  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");
  const [sortOption, setSortOption] = useState<FleetSortOption>("default");

  const parsedMinPrice = useMemo(() => {
    const value = priceMinInput.trim();
    if (!value) return undefined;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }, [priceMinInput]);

  const parsedMaxPrice = useMemo(() => {
    const value = priceMaxInput.trim();
    if (!value) return undefined;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }, [priceMaxInput]);

  const filteredVehicles = useMemo<Vehicle[]>(() => {
    const filtered = activeVehicles
      .map((vehicle) => {
        if (!vehicleMatchesCategory(vehicle, categoryFilter)) return null;

        const searchText = `${vehicle.brand} ${vehicle.model}`.toLowerCase();
        if (search.trim() && !searchText.includes(search.trim().toLowerCase())) return null;

        const packages = vehicle.rentalPackages || [];
        if (!packages.length) return vehicle;
        if (typeof parsedMinPrice !== "number" && typeof parsedMaxPrice !== "number") return vehicle;

        const filteredPackages = packages.filter((pkg) => {
          const prices = [pkg.prices[1000], pkg.prices[2000], pkg.prices[3000]].filter(
            (price): price is number => typeof price === "number" && Number.isFinite(price) && price > 0
          );

          if (!prices.length) return false;
          if (typeof parsedMinPrice === "number" && prices.every((price) => price < parsedMinPrice)) return false;
          if (typeof parsedMaxPrice === "number" && prices.every((price) => price > parsedMaxPrice)) return false;
          return true;
        });

        if (!filteredPackages.length) return null;
        return { ...vehicle, rentalPackages: filteredPackages };
      })
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle));

    return sortVehicles(filtered, sortOption);
  }, [activeVehicles, categoryFilter, parsedMaxPrice, parsedMinPrice, search, sortOption]);

  const categoryCounts = useMemo(() => {
    const counts: Record<FleetCategoryFilter, number> = {
      all: activeVehicles.length,
      suv: 0,
      sedan: 0,
      hatchback: 0,
      commercial: 0,
      luxury: 0,
      electric: 0
    };

    CATEGORY_OPTIONS.forEach((category) => {
      counts[category] = activeVehicles.filter((vehicle) => vehicleMatchesCategory(vehicle, category)).length;
    });

    return counts;
  }, [activeVehicles]);

  const activeCategoryTitle =
    categoryFilter === "all"
      ? locale === "tr"
        ? "T\u00fcm Ara\u00e7lar"
        : "All Vehicles"
      : `${vehicleCategoryLabel(categoryFilter as VehicleCategory, locale)} ${
          locale === "tr" ? "Ara\u00e7lar" : "Vehicles"
        }`;

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setPriceMinInput("");
    setPriceMaxInput("");
    setSortOption("default");
  };

  return (
    <>
      <section className="premium-gradient relative overflow-hidden py-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(216,177,106,0.24),transparent_34%),linear-gradient(180deg,rgba(4,15,31,0.2)_0%,rgba(4,15,31,0.5)_100%)]" />
        <div className="container-wide relative z-10 grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-2xl border border-white/45 bg-white/22 p-6 shadow-xl backdrop-blur-md">
            <p className="text-[0.96rem] font-extrabold uppercase tracking-[0.14em] text-gold-200">
              {locale === "tr" ? "Kurumsal Filo" : "Corporate Fleet"}
            </p>
            <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.16] text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.6)] sm:text-[2.25rem]">
              {locale === "tr"
                ? "Uzun D\u00f6nem Kiralamada G\u00fc\u00e7l\u00fc \u00c7\u00f6z\u00fcm Orta\u011f\u0131n\u0131z"
                : "Your Strong Partner in Long-Term Rental"}
            </h1>
          </div>

          <div className="mx-auto overflow-hidden rounded-2xl border border-white/30 bg-white/95 p-3 shadow-soft">
            <Image
              src="/images/fleet/filo-logo.jpeg"
              alt={locale === "tr" ? "\u015eim\u015feko\u011flu Filo Logosu" : "Simsekoglu Fleet Logo"}
              width={360}
              height={240}
              className="h-auto w-[250px] object-contain sm:w-[300px] lg:w-[340px]"
              priority
            />
          </div>

          <div className="rounded-2xl border border-white/45 bg-white/22 p-6 shadow-xl backdrop-blur-md">
            <p className="text-[1.08rem] font-semibold leading-8 text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.58)]">
              {locale === "tr"
                ? "Ayl\u0131k ara\u00e7 kiralama operasyonlar\u0131nda \u015feffaf fiyatlama, h\u0131zl\u0131 teslimat ve s\u00fcrd\u00fcr\u00fclebilir filo y\u00f6netimi sunuyoruz."
                : "We provide transparent pricing, fast delivery, and sustainable fleet management for monthly rentals."}
            </p>
          </div>
        </div>
      </section>

      <section className="section-spacing relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_20%,rgba(11,31,58,0.08),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(185,139,53,0.12),transparent_34%)]" />
        <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title={t(locale, "vehicleList")}
            description={
              locale === "tr"
                ? "Kategoriye g\u00f6re ke\u015ffedin, ara\u00e7lar\u0131 sade ve net \u015fekilde filtreleyin."
                : "Browse by category with simple and clear filtering."
            }
          />

          <div className="mb-6 -mx-1 flex gap-3 overflow-x-auto rounded-2xl bg-navy-900/3 px-2 py-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
            {CATEGORY_CHIPS.map((chip) => {
              const isActive = categoryFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setCategoryFilter(chip.id)}
                  className={`group min-w-[170px] rounded-2xl border bg-white p-4 text-left transition md:min-w-0 ${
                    isActive
                      ? "border-gold-500 shadow-[0_10px_25px_-18px_rgba(185,139,53,0.8)]"
                      : "border-navy-900/10 hover:border-gold-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11px] font-extrabold ${
                        isActive
                          ? "bg-gold-500/20 text-gold-700"
                          : "border border-navy-900/15 bg-cloud-50 text-navy-900/70"
                      }`}
                    >
                      {chip.icon}
                    </span>
                    <span className="text-xs font-bold text-navy-900/70">{categoryCounts[chip.id]}</span>
                  </div>
                  <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.04em] text-navy-900">
                    {locale === "tr" ? chip.labelTr : chip.labelEn}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mb-8 flex gap-3 overflow-x-auto rounded-2xl border border-navy-900/12 bg-white p-4 shadow-soft md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
            <label className="min-w-[220px] space-y-1 text-sm md:min-w-0">
              <span className="font-semibold text-navy-900">{locale === "tr" ? "Ara" : "Search"}</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={locale === "tr" ? "Marka veya model" : "Brand or model"}
                className="h-11 w-full rounded-lg border border-navy-900/20 px-3"
              />
            </label>

            <label className="min-w-[220px] space-y-1 text-sm md:min-w-0">
              <span className="font-semibold text-navy-900">{locale === "tr" ? "Kategori" : "Category"}</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as FleetCategoryFilter)}
                className="h-11 w-full rounded-lg border border-navy-900/20 px-3"
              >
                <option value="all">{locale === "tr" ? "T\u00fcm Ara\u00e7lar" : "All Vehicles"}</option>
                <option value="suv">SUV</option>
                <option value="sedan">Sedan</option>
                <option value="hatchback">Hatchback</option>
                <option value="commercial">{locale === "tr" ? "Ticari" : "Commercial"}</option>
                <option value="luxury">{locale === "tr" ? "L\u00fcks" : "Luxury"}</option>
                <option value="electric">{locale === "tr" ? "Elektrikli" : "Electric"}</option>
              </select>
            </label>

            <div className="min-w-[240px] space-y-1 text-sm md:min-w-0">
              <span className="font-semibold text-navy-900">{locale === "tr" ? "Fiyat Aral\u0131\u011f\u0131" : "Price Range"}</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={priceMinInput}
                  placeholder={locale === "tr" ? "Min TL" : "Min TRY"}
                  onChange={(event) => setPriceMinInput(event.target.value)}
                  className="h-11 w-full rounded-lg border border-navy-900/20 px-3"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={priceMaxInput}
                  placeholder={locale === "tr" ? "Max TL" : "Max TRY"}
                  onChange={(event) => setPriceMaxInput(event.target.value)}
                  className="h-11 w-full rounded-lg border border-navy-900/20 px-3"
                />
              </div>
            </div>

            <label className="min-w-[220px] space-y-1 text-sm md:min-w-0">
              <span className="font-semibold text-navy-900">{locale === "tr" ? "S\u0131ralama" : "Sorting"}</span>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as FleetSortOption)}
                className="h-11 w-full rounded-lg border border-navy-900/20 px-3"
              >
                <option value="default">{locale === "tr" ? "Varsay\u0131lan" : "Default"}</option>
                <option value="price-asc">
                  {locale === "tr" ? "Fiyat: D\u00fc\u015f\u00fckten Y\u00fckse\u011fe" : "Price: Low to High"}
                </option>
                <option value="price-desc">
                  {locale === "tr" ? "Fiyat: Y\u00fcksekten D\u00fc\u015f\u00fc\u011fe" : "Price: High to Low"}
                </option>
              </select>
            </label>

            <div className="flex min-w-[180px] items-end md:min-w-0">
              <button
                type="button"
                onClick={resetFilters}
                className="h-11 w-full rounded-lg border border-navy-900/20 px-4 text-sm font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
              >
                {locale === "tr" ? "Filtreleri Temizle" : "Clear Filters"}
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-2xl font-extrabold uppercase tracking-[0.03em] text-navy-900">{activeCategoryTitle}</h3>
            <p className="text-sm text-navy-900/65">
              {filteredVehicles.length} {locale === "tr" ? "ara\u00e7 bulundu" : "vehicles found"}
            </p>
          </div>

          {filteredVehicles.length ? (
            <div className="space-y-5">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-navy-900/20 bg-white p-8 text-center">
              <p className="text-sm text-navy-900/65">
                {locale === "tr" ? "Bu filtrelere uygun ara\u00e7 bulunamad\u0131." : "No vehicles match these filters."}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-lg border border-navy-900/20 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
              >
                {locale === "tr" ? "Filtreleri Temizle" : "Clear Filters"}
              </button>
            </div>
          )}

          <p className="mt-8 text-sm font-medium text-navy-900/65">
            {locale === "tr"
              ? "Fiyatlar\u0131m\u0131z min. 6-12-24 ay kiralama i\u00e7in ge\u00e7erlidir."
              : "Our pricing applies to minimum 6-12-24 month rentals."}
          </p>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
