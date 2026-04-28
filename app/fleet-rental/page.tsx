"use client";

import { useEffect, useMemo, useState } from "react";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { useSiteData } from "@/components/providers/site-data-provider";
import { CtaBanner } from "@/components/shared/cta-banner";
import { PageHero } from "@/components/shared/page-hero";
import { SectionTitle } from "@/components/shared/section-title";
import { t, vehicleCategoryLabel } from "@/lib/i18n";
import { FuelType, RentalKm, TransmissionType, Vehicle, VehicleCategory } from "@/lib/types";

const CATEGORY_OPTIONS: VehicleCategory[] = [
  "suv",
  "electric",
  "economy",
  "luxury",
  "commercial",
  "sedan",
  "hatchback",
  "van"
];

type FleetCategoryFilter = "all" | VehicleCategory;
type FleetSortOption = "default" | "price-asc" | "price-desc";

const CATEGORY_CHIPS: Array<{
  id: FleetCategoryFilter;
  icon: string;
  labelTr: string;
  labelEn: string;
}> = [
  { id: "all", icon: "TÜM", labelTr: "Tüm Araçlar", labelEn: "All Vehicles" },
  { id: "suv", icon: "SUV", labelTr: "SUV", labelEn: "SUV" },
  { id: "electric", icon: "EV", labelTr: "Elektrikli", labelEn: "Electric" },
  { id: "economy", icon: "₺", labelTr: "Ekonomik", labelEn: "Economy" },
  { id: "luxury", icon: "L", labelTr: "Lüks", labelEn: "Luxury" },
  { id: "commercial", icon: "T", labelTr: "Ticari", labelEn: "Commercial" },
  { id: "sedan", icon: "S", labelTr: "Sedan", labelEn: "Sedan" },
  { id: "hatchback", icon: "H", labelTr: "Hatchback", labelEn: "Hatchback" },
  { id: "van", icon: "V", labelTr: "Van", labelEn: "Van" }
];

function normalizeFuelForFilter(fuel: FuelType): Exclude<FuelType, "Elektrik"> {
  return fuel === "Elektrik" ? "Elektrikli" : fuel;
}

function vehicleMatchesCategory(vehicle: Vehicle, category: FleetCategoryFilter): boolean {
  if (category === "all") return true;
  const hasElectricPackage = (vehicle.rentalPackages || []).some(
    (pkg) => normalizeFuelForFilter(pkg.fuelType) === "Elektrikli"
  );
  if (category === "electric") {
    return (
      vehicle.primaryCategory === "electric" ||
      vehicle.secondaryCategories.includes("electric") ||
      hasElectricPackage
    );
  }
  return vehicle.primaryCategory === category || vehicle.secondaryCategories.includes(category);
}

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

export default function FleetRentalPage() {
  const { locale, content } = useSiteData();

  const activeVehicles = useMemo(() => content.vehicles.filter((vehicle) => vehicle.active), [content.vehicles]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FleetCategoryFilter>("all");
  const [fuelFilter, setFuelFilter] = useState<"all" | Exclude<FuelType, "Elektrik">>("all");
  const [transmissionFilter, setTransmissionFilter] = useState<"all" | TransmissionType>("all");
  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");
  const [sortOption, setSortOption] = useState<FleetSortOption>("default");
  const [forceResultsView, setForceResultsView] = useState(false);

  useEffect(() => {
    if (categoryFilter === "electric" && fuelFilter !== "Elektrikli") {
      setFuelFilter("Elektrikli");
    }
  }, [categoryFilter, fuelFilter]);

  const effectiveFuelFilter: "all" | Exclude<FuelType, "Elektrik"> =
    categoryFilter === "electric" ? "Elektrikli" : fuelFilter;

  const parsedMinPrice = useMemo(() => {
    const value = priceMinInput.trim();
    if (!value) return undefined;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : undefined;
  }, [priceMinInput]);

  const parsedMaxPrice = useMemo(() => {
    const value = priceMaxInput.trim();
    if (!value) return undefined;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : undefined;
  }, [priceMaxInput]);

  const fuelOptions = useMemo(() => {
    const values = new Set<Exclude<FuelType, "Elektrik">>();
    activeVehicles.forEach((vehicle) =>
      (vehicle.rentalPackages || []).forEach((pkg) => values.add(normalizeFuelForFilter(pkg.fuelType)))
    );
    return Array.from(values);
  }, [activeVehicles]);

  const transmissionOptions = useMemo(() => {
    const values = new Set<TransmissionType>();
    activeVehicles.forEach((vehicle) => (vehicle.rentalPackages || []).forEach((pkg) => values.add(pkg.transmission)));
    return Array.from(values);
  }, [activeVehicles]);

  const visibleFuelOptions = categoryFilter === "electric" ? (["Elektrikli"] as Exclude<FuelType, "Elektrik">[]) : fuelOptions;

  const filteredVehicles = useMemo<Vehicle[]>(() => {
    const hasVariantSpecificFilter =
      effectiveFuelFilter !== "all" ||
      transmissionFilter !== "all" ||
      typeof parsedMinPrice === "number" ||
      typeof parsedMaxPrice === "number";

    const filtered = activeVehicles
      .map((vehicle) => {
        const inCategory = vehicleMatchesCategory(vehicle, categoryFilter);
        const searchText = `${vehicle.brand} ${vehicle.model}`.toLowerCase();
        const inSearch = search.trim() ? searchText.includes(search.trim().toLowerCase()) : true;

        if (!inCategory || !inSearch) return null;

        const packages = vehicle.rentalPackages || [];
        if (!packages.length) {
          return hasVariantSpecificFilter ? null : vehicle;
        }

        const filteredPackages = packages.filter((pkg) => {
          const fuel = normalizeFuelForFilter(pkg.fuelType);
          if (effectiveFuelFilter !== "all" && fuel !== effectiveFuelFilter) return false;
          if (transmissionFilter !== "all" && pkg.transmission !== transmissionFilter) return false;

          const prices = ([1000, 2000, 3000] as RentalKm[])
            .map((km) => pkg.prices[km])
            .filter((price): price is number => typeof price === "number" && Number.isFinite(price) && price > 0);
          if (!prices.length) return false;
          if (typeof parsedMinPrice === "number" && prices.every((price) => price < parsedMinPrice)) return false;
          if (typeof parsedMaxPrice === "number" && prices.every((price) => price > parsedMaxPrice)) return false;
          return true;
        });

        if (!filteredPackages.length) return null;

        return {
          ...vehicle,
          rentalPackages: filteredPackages
        };
      })
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle));

    return sortVehicles(filtered, sortOption);
  }, [
    activeVehicles,
    categoryFilter,
    effectiveFuelFilter,
    parsedMaxPrice,
    parsedMinPrice,
    search,
    sortOption,
    transmissionFilter
  ]);

  const categoryCounts = useMemo(() => {
    const counts: Record<FleetCategoryFilter, number> = {
      all: activeVehicles.length,
      suv: 0,
      electric: 0,
      economy: 0,
      luxury: 0,
      commercial: 0,
      sedan: 0,
      hatchback: 0,
      van: 0
    };

    CATEGORY_OPTIONS.forEach((category) => {
      counts[category] = activeVehicles.filter((vehicle) => vehicleMatchesCategory(vehicle, category)).length;
    });

    return counts;
  }, [activeVehicles]);

  const hasAnyFilterApplied =
    categoryFilter !== "all" ||
    search.trim().length > 0 ||
    fuelFilter !== "all" ||
    transmissionFilter !== "all" ||
    priceMinInput.trim().length > 0 ||
    priceMaxInput.trim().length > 0;

  const showResultGrid = forceResultsView || hasAnyFilterApplied;

  const showcaseSections = useMemo(
    () => [
      {
        id: "featured",
        titleTr: "Öne Çıkan Araçlar",
        titleEn: "Featured Vehicles",
        vehicles: sortVehicles(activeVehicles.filter((vehicle) => vehicle.featured), sortOption).slice(0, 6),
        category: "all" as FleetCategoryFilter
      },
      {
        id: "electric",
        titleTr: "Elektrikli Araçlar",
        titleEn: "Electric Vehicles",
        vehicles: sortVehicles(
          activeVehicles.filter((vehicle) => vehicleMatchesCategory(vehicle, "electric")),
          sortOption
        ).slice(0, 6),
        category: "electric" as FleetCategoryFilter
      },
      {
        id: "luxury",
        titleTr: "Lüks Araçlar",
        titleEn: "Luxury Vehicles",
        vehicles: sortVehicles(
          activeVehicles.filter((vehicle) => vehicleMatchesCategory(vehicle, "luxury")),
          sortOption
        ).slice(0, 6),
        category: "luxury" as FleetCategoryFilter
      },
      {
        id: "economy",
        titleTr: "Ekonomik Araçlar",
        titleEn: "Economy Vehicles",
        vehicles: sortVehicles(
          activeVehicles.filter((vehicle) => vehicleMatchesCategory(vehicle, "economy")),
          sortOption
        ).slice(0, 6),
        category: "economy" as FleetCategoryFilter
      },
      {
        id: "suv",
        titleTr: "SUV Araçlar",
        titleEn: "SUV Vehicles",
        vehicles: sortVehicles(activeVehicles.filter((vehicle) => vehicleMatchesCategory(vehicle, "suv")), sortOption).slice(0, 6),
        category: "suv" as FleetCategoryFilter
      }
    ],
    [activeVehicles, sortOption]
  );

  const activeCategoryTitle =
    categoryFilter === "all"
      ? locale === "tr"
        ? "Tüm Araçlar"
        : "All Vehicles"
      : `${vehicleCategoryLabel(categoryFilter, locale)} ${locale === "tr" ? "Araçlar" : "Vehicles"}`;

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setFuelFilter("all");
    setTransmissionFilter("all");
    setPriceMinInput("");
    setPriceMaxInput("");
    setSortOption("default");
    setForceResultsView(false);
  };

  const applyCategory = (next: FleetCategoryFilter, showResults = true) => {
    setCategoryFilter(next);
    if (next === "electric") {
      setFuelFilter("Elektrikli");
    }
    setForceResultsView(showResults);
  };

  return (
    <>
      <PageHero
        eyebrow={locale === "tr" ? "Araç Kiralama" : "Fleet Rental"}
        title={
          locale === "tr"
            ? "Kurumsal Aylık Kiralama ile Güçlü Filo Yönetimi"
            : "Strong Fleet Management with Monthly Corporate Rental"
        }
        description={
          locale === "tr"
            ? "Şimşekoğlu Grup, şirketlerin operasyonel ihtiyaçları için farklı segmentlerde aylık araç kiralama çözümleri sunar."
            : "Simsekoglu Group delivers monthly vehicle rental solutions in multiple segments for corporate operational needs."
        }
      />

      <section className="section-spacing">
        <div className="container-wide">
          <SectionTitle
            title={t(locale, "vehicleList")}
            description={
              locale === "tr"
                ? "Kategoriye göre keşfedin, gerçek araç paketlerine göre filtreleyin."
                : "Browse by category and filter using real rental package data."
            }
          />

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {CATEGORY_CHIPS.map((chip) => {
              const isActive = categoryFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => applyCategory(chip.id, chip.id !== "all" || hasAnyFilterApplied)}
                  className={`group rounded-2xl border bg-white p-4 text-left transition ${
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

          <div className="mb-8 grid gap-4 rounded-2xl border border-navy-900/10 bg-white p-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-navy-900">{locale === "tr" ? "Ara" : "Search"}</span>
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setForceResultsView(true);
                }}
                placeholder={locale === "tr" ? "Marka veya model" : "Brand or model"}
                className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-semibold text-navy-900">{locale === "tr" ? "Kategori" : "Category"}</span>
              <select
                value={categoryFilter}
                onChange={(event) => applyCategory(event.target.value as FleetCategoryFilter, true)}
                className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
              >
                <option value="all">{t(locale, "all")}</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {vehicleCategoryLabel(category, locale)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-semibold text-navy-900">{t(locale, "fuelType")}</span>
              <select
                value={effectiveFuelFilter}
                onChange={(event) => {
                  setFuelFilter(event.target.value as "all" | Exclude<FuelType, "Elektrik">);
                  setForceResultsView(true);
                }}
                disabled={categoryFilter === "electric"}
                className="w-full rounded-lg border border-navy-900/20 px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {categoryFilter !== "electric" ? <option value="all">{t(locale, "all")}</option> : null}
                {visibleFuelOptions.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
              {categoryFilter === "electric" ? (
                <p className="text-xs text-gold-700">
                  {locale === "tr"
                    ? "Elektrikli kategori seçildiği için yakıt tipi otomatik olarak Elektrikli."
                    : "Fuel is automatically set to Electric for the electric category."}
                </p>
              ) : null}
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-semibold text-navy-900">{t(locale, "transmission")}</span>
              <select
                value={transmissionFilter}
                onChange={(event) => {
                  setTransmissionFilter(event.target.value as "all" | TransmissionType);
                  setForceResultsView(true);
                }}
                className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
              >
                <option value="all">{t(locale, "all")}</option>
                {transmissionOptions.map((transmission) => (
                  <option key={transmission} value={transmission}>
                    {transmission}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-1 text-sm">
              <span className="font-semibold text-navy-900">{locale === "tr" ? "Fiyat Aralığı" : "Price Range"}</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={priceMinInput}
                  placeholder={locale === "tr" ? "Min TL" : "Min TRY"}
                  onChange={(event) => {
                    setPriceMinInput(event.target.value);
                    setForceResultsView(true);
                  }}
                  className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={priceMaxInput}
                  placeholder={locale === "tr" ? "Max TL" : "Max TRY"}
                  onChange={(event) => {
                    setPriceMaxInput(event.target.value);
                    setForceResultsView(true);
                  }}
                  className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                />
              </div>
            </div>

            <label className="space-y-1 text-sm">
              <span className="font-semibold text-navy-900">{locale === "tr" ? "Sıralama" : "Sorting"}</span>
              <select
                value={sortOption}
                onChange={(event) => {
                  setSortOption(event.target.value as FleetSortOption);
                  setForceResultsView(true);
                }}
                className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
              >
                <option value="default">{locale === "tr" ? "Varsayılan" : "Default"}</option>
                <option value="price-asc">
                  {locale === "tr" ? "Fiyat: Düşükten Yükseğe" : "Price: Low to High"}
                </option>
                <option value="price-desc">
                  {locale === "tr" ? "Fiyat: Yüksekten Düşüğe" : "Price: High to Low"}
                </option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full rounded-lg border border-navy-900/20 px-4 py-2.5 text-sm font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
              >
                {locale === "tr" ? "Filtreleri Temizle" : "Clear Filters"}
              </button>
            </div>
          </div>

          {showResultGrid ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-extrabold uppercase tracking-[0.03em] text-navy-900">
                  {activeCategoryTitle}
                </h3>
                <p className="text-sm text-navy-900/65">
                  {filteredVehicles.length} {locale === "tr" ? "araç bulundu" : "vehicles found"}
                </p>
              </div>
              {filteredVehicles.length ? (
                <div className="space-y-4">
                  {filteredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-navy-900/20 bg-white p-8 text-center">
                  <p className="text-sm text-navy-900/65">
                    {locale === "tr" ? "Bu filtrelere uygun araç bulunamadı." : "No vehicles match these filters."}
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
            </>
          ) : (
            <div className="space-y-10">
              {showcaseSections.map((section) => (
                <section key={section.id}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-extrabold uppercase tracking-[0.03em] text-navy-900">
                        {locale === "tr" ? section.titleTr : section.titleEn}
                      </h3>
                      <p className="text-sm text-navy-900/60">
                        {section.vehicles.length} {locale === "tr" ? "araç" : "vehicles"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyCategory(section.category, true)}
                      className="rounded-full border border-navy-900/20 px-4 py-2 text-xs font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
                    >
                      {locale === "tr" ? "Tümünü Gör" : "View All"}
                    </button>
                  </div>

                  {section.vehicles.length ? (
                    <div className="space-y-4">
                      {section.vehicles.map((vehicle) => (
                        <VehicleCard key={`${section.id}-${vehicle.id}`} vehicle={vehicle} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-navy-900/20 bg-white p-6 text-sm text-navy-900/65">
                      {locale === "tr" ? "Bu kategoride araç bulunamadı." : "No vehicles available in this category."}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}

          <p className="mt-8 text-sm font-medium text-navy-900/65">
            Fiyatlarımız min. 6-12-24 ay kiralama için geçerlidir.
          </p>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

