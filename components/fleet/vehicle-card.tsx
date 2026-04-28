"use client";

import { useEffect, useMemo, useState } from "react";
import { VehicleMediaGallery } from "@/components/fleet/vehicle-media-gallery";
import { useSiteData } from "@/components/providers/site-data-provider";
import { QuoteButton } from "@/components/shared/quote-button";
import { RevealOnScroll } from "@/components/shared/reveal-on-scroll";
import { buildWhatsAppUrl, buildZeroKmQuoteMessage } from "@/lib/data/whatsapp";
import { currencyTl, t, vehicleCategoryLabel } from "@/lib/i18n";
import { FuelType, RentalKm, RentalPackage, TransmissionType, Vehicle } from "@/lib/types";

type KmOption = RentalKm;
const KM_OPTIONS: KmOption[] = [1000, 2000, 3000];

function uniqueValues<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function normalizedFuel(value: FuelType): Exclude<FuelType, "Elektrik"> {
  return value === "Elektrik" ? "Elektrikli" : value;
}

function getPackagePrice(pkg: RentalPackage | undefined, km: KmOption | null): number | null {
  if (!pkg || km === null) return null;
  const price = pkg.prices[km];
  return typeof price === "number" && Number.isFinite(price) && price > 0 ? price : null;
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { locale, content } = useSiteData();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const packages = useMemo(
    () => (vehicle.rentalPackages || []).filter((pkg) => pkg && pkg.fuelType && pkg.transmission),
    [vehicle.rentalPackages]
  );

  const [selectedFuelType, setSelectedFuelType] = useState<Exclude<FuelType, "Elektrik"> | null>(null);
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionType | null>(null);
  const [selectedMonthlyKm, setSelectedMonthlyKm] = useState<KmOption | null>(null);
  const [rentalStartDate, setRentalStartDate] = useState("");
  const [dateError, setDateError] = useState("");

  const mediaImages = useMemo(
    () => Array.from(new Set([vehicle.mainImage, ...(vehicle.galleryImages || [])].filter(Boolean))),
    [vehicle.galleryImages, vehicle.mainImage]
  );

  const categoryTags = useMemo(
    () => uniqueValues([vehicle.primaryCategory, ...(vehicle.secondaryCategories || [])]),
    [vehicle.primaryCategory, vehicle.secondaryCategories]
  );

  const fuelOptions = useMemo(
    () => uniqueValues(packages.map((pkg) => normalizedFuel(pkg.fuelType))),
    [packages]
  );

  useEffect(() => {
    if (!fuelOptions.length) {
      setSelectedFuelType(null);
      return;
    }
    if (!selectedFuelType || !fuelOptions.includes(selectedFuelType)) {
      setSelectedFuelType(fuelOptions[0]);
    }
  }, [fuelOptions, selectedFuelType]);

  const transmissionOptions = useMemo(() => {
    if (!selectedFuelType) return [];
    return uniqueValues(
      packages
        .filter((pkg) => normalizedFuel(pkg.fuelType) === selectedFuelType)
        .map((pkg) => pkg.transmission)
    );
  }, [packages, selectedFuelType]);

  useEffect(() => {
    if (!transmissionOptions.length) {
      setSelectedTransmission(null);
      return;
    }
    if (!selectedTransmission || !transmissionOptions.includes(selectedTransmission)) {
      setSelectedTransmission(transmissionOptions[0]);
    }
  }, [selectedTransmission, transmissionOptions]);

  const selectedPackage = useMemo(() => {
    if (!selectedFuelType || !selectedTransmission) return undefined;
    return packages.find(
      (pkg) =>
        normalizedFuel(pkg.fuelType) === selectedFuelType && pkg.transmission === selectedTransmission
    );
  }, [packages, selectedFuelType, selectedTransmission]);

  const monthlyKmOptions = useMemo(() => {
    if (!selectedPackage) return [];
    return KM_OPTIONS.filter((km) => {
      const price = selectedPackage.prices[km];
      return typeof price === "number" && Number.isFinite(price) && price > 0;
    });
  }, [selectedPackage]);

  useEffect(() => {
    if (!monthlyKmOptions.length) {
      setSelectedMonthlyKm(null);
      return;
    }
    if (!selectedMonthlyKm || !monthlyKmOptions.includes(selectedMonthlyKm)) {
      setSelectedMonthlyKm(monthlyKmOptions[0]);
    }
  }, [monthlyKmOptions, selectedMonthlyKm]);

  const selectedPrice = useMemo(
    () => getPackagePrice(selectedPackage, selectedMonthlyKm),
    [selectedMonthlyKm, selectedPackage]
  );

  const minRentalDate = useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }, []);

  const hasPackages = packages.length > 0;
  const hasSelectableCombination =
    hasPackages &&
    Boolean(selectedFuelType) &&
    Boolean(selectedTransmission) &&
    selectedMonthlyKm !== null &&
    typeof selectedPrice === "number";

  const infoText = locale === "tr" ? vehicle.infoTr : vehicle.infoEn;

  return (
    <RevealOnScroll>
      <article className="premium-card glass-card p-4 lg:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
          <div className="w-full shrink-0 overflow-hidden rounded-2xl border border-navy-900/10 bg-white lg:w-[290px] xl:w-[320px]">
            <VehicleMediaGallery
              title={`${vehicle.brand} ${vehicle.model}`}
              images={mediaImages}
              carouselActive={vehicle.carouselActive}
              carouselSpeed={vehicle.carouselSpeed}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <button
                type="button"
                onClick={() => setIsInfoOpen((prev) => !prev)}
                className="group inline-flex items-center gap-2 text-left"
              >
                <h3 className="card-title text-2xl font-extrabold uppercase tracking-[0.03em] text-navy-900">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <span className="text-xs font-bold text-gold-700 transition group-hover:text-gold-600">
                  {isInfoOpen ? "Gizle" : "Bilgileri Gör"}
                </span>
              </button>
              <p className="mt-1 text-sm font-semibold text-navy-900/70">
                Model Yılı: {vehicle.modelYearLabel || "2024+"}
              </p>
              {isInfoOpen ? (
                <div className="mt-3 rounded-xl border border-navy-900/10 bg-cloud-50 p-3">
                  <p className="text-sm text-navy-900/80">
                    {infoText?.trim() ||
                      (locale === "tr"
                        ? "Bu araçla ilgili detaylı bilgi yakında eklenecek."
                        : "Detailed vehicle information will be added soon.")}
                  </p>
                  {vehicle.officialUrl ? (
                    <a
                      href={vehicle.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm font-semibold text-gold-700 underline-offset-2 hover:text-gold-600 hover:underline"
                    >
                      {locale === "tr" ? "Resmi Siteye Git" : "Open Official Website"}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {categoryTags.map((category) => (
                <span
                  key={`${vehicle.id}-${category}`}
                  className="rounded-full border border-gold-500/35 bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-700"
                >
                  {vehicleCategoryLabel(category, locale)}
                </span>
              ))}
            </div>

            {hasPackages ? (
              <div className="grid gap-3 md:grid-cols-3">
                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-navy-900/70">{t(locale, "fuelType")}</span>
                  <select
                    value={selectedFuelType ?? ""}
                    onChange={(event) => setSelectedFuelType(event.target.value as Exclude<FuelType, "Elektrik">)}
                    className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2.5 text-sm font-semibold text-navy-900"
                  >
                    {fuelOptions.map((fuelType) => (
                      <option key={fuelType} value={fuelType}>
                        {fuelType}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-navy-900/70">{t(locale, "transmission")}</span>
                  <select
                    value={selectedTransmission ?? ""}
                    onChange={(event) => setSelectedTransmission(event.target.value as TransmissionType)}
                    className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2.5 text-sm font-semibold text-navy-900"
                  >
                    {transmissionOptions.map((transmission) => (
                      <option key={transmission} value={transmission}>
                        {transmission}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-navy-900/70">{t(locale, "monthlyKm")}</span>
                  <select
                    value={selectedMonthlyKm ?? ""}
                    onChange={(event) => setSelectedMonthlyKm(Number(event.target.value) as KmOption)}
                    className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2.5 text-sm font-semibold text-navy-900"
                  >
                    {monthlyKmOptions.map((monthlyKm) => (
                      <option key={monthlyKm} value={monthlyKm}>
                        {monthlyKm.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")} KM
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-navy-900/20 bg-cloud-50 px-4 py-3 text-sm font-semibold text-navy-900/70">
                Kiralama fiyatları yakında eklenecek.
              </div>
            )}

            {hasPackages ? (
              <label className="block max-w-sm space-y-1.5 rounded-xl border border-navy-900/10 bg-white p-3">
                <span className="text-sm font-semibold text-navy-900/70">
                  {locale === "tr" ? "Kiralama Başlangıç Tarihi" : "Rental Start Date"}
                </span>
                <input
                  type="date"
                  min={minRentalDate}
                  value={rentalStartDate}
                  onChange={(event) => {
                    const nextDate = event.target.value;
                    setRentalStartDate(nextDate);
                    if (nextDate && nextDate < minRentalDate) {
                      setDateError(
                        locale === "tr"
                          ? "Başlangıç tarihi bugünden önce olamaz."
                          : "Start date cannot be earlier than today."
                      );
                      return;
                    }
                    setDateError("");
                  }}
                  className="w-full rounded-lg border border-navy-900/20 bg-cloud-50 px-3 py-2.5 text-sm font-semibold text-navy-900 outline-none transition focus:border-gold-500"
                />
                {dateError ? <p className="text-xs font-medium text-red-600">{dateError}</p> : null}
              </label>
            ) : null}
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-navy-900/10 bg-white p-4 lg:w-[240px] xl:w-[270px]">
            <p className="text-sm font-semibold text-navy-900/65">{t(locale, "monthlyPrice")}</p>
            {hasSelectableCombination ? (
              <>
                <p className="price-text mt-1">{currencyTl(selectedPrice as number, locale)}</p>
                <p className="text-sm font-semibold text-navy-900/65">+ KDV / AY</p>
              </>
            ) : hasPackages ? (
              <p className="mt-2 text-sm font-semibold text-red-600">Bu kombinasyon için fiyat tanımlanmamış.</p>
            ) : (
              <p className="mt-2 text-sm font-semibold text-navy-900/55">Fiyat bilgisi yakında eklenecek.</p>
            )}

            <div className="mt-4">
              {hasSelectableCombination ? (
                <QuoteButton
                  className="w-full justify-center px-4 py-3 text-base shadow-[0_8px_20px_-12px_rgba(199,155,74,0.95)]"
                  serviceType="fleet"
                  rentalStartDate={dateError ? undefined : rentalStartDate}
                  vehicle={vehicle}
                  variant={{
                    fuelType: selectedFuelType as FuelType,
                    transmission: selectedTransmission as TransmissionType,
                    monthlyKm: selectedMonthlyKm as number,
                    monthlyPrice: selectedPrice as number
                  }}
                  showFormButton={false}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-full bg-slate-300 px-4 py-3 text-base font-bold text-slate-600 disabled:cursor-not-allowed"
                >
                  OPSİYONLA
                </button>
              )}
            </div>

            <a
              href={buildWhatsAppUrl(content.contact.whatsapp, buildZeroKmQuoteMessage())}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-xs font-semibold text-gold-700 underline-offset-2 transition hover:text-gold-600 hover:underline"
            >
              0 KM Araçlar İçin Teklif Al
            </a>

            <p className="mt-3 text-xs text-navy-900/60">Fiyatlarımız min. 6-12-24 ay kiralama için geçerlidir.</p>
          </div>
        </div>
      </article>
    </RevealOnScroll>
  );
}

