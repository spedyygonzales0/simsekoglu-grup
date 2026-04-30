"use client";

import { useEffect, useMemo, useState } from "react";
import { VehicleDetailModal } from "@/components/fleet/vehicle-detail-modal";
import { VehicleMediaGallery } from "@/components/fleet/vehicle-media-gallery";
import { useSiteData } from "@/components/providers/site-data-provider";
import { QuoteButton } from "@/components/shared/quote-button";
import { RevealOnScroll } from "@/components/shared/reveal-on-scroll";
import {
  buildQuoteMessage,
  buildWhatsAppUrl,
  buildZeroKmQuoteMessage,
  getWhatsappNumberByChannel
} from "@/lib/data/whatsapp";
import { currencyTl, fuelTypeLabel, t, transmissionLabel, vehicleCategoryLabel } from "@/lib/i18n";
import { FuelType, RentalKm, RentalPackage, TransmissionType, Vehicle } from "@/lib/types";

type KmOption = RentalKm;
const KM_OPTIONS: KmOption[] = [1000, 2000, 3000];
const FLEET_TERMS_PDF_PATH = "/documents/arac-kiralama-sartnamesi.pdf";

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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailInitialIndex, setDetailInitialIndex] = useState(0);

  const packages = useMemo(
    () => (vehicle.rentalPackages || []).filter((pkg) => pkg && pkg.fuelType && pkg.transmission),
    [vehicle.rentalPackages]
  );

  const [selectedFuelType, setSelectedFuelType] = useState<Exclude<FuelType, "Elektrik"> | null>(null);
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionType | null>(null);
  const [selectedMonthlyKm, setSelectedMonthlyKm] = useState<KmOption | null>(1000);
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

  const fuelOptions = useMemo(() => uniqueValues(packages.map((pkg) => normalizedFuel(pkg.fuelType))), [packages]);

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
      packages.filter((pkg) => normalizedFuel(pkg.fuelType) === selectedFuelType).map((pkg) => pkg.transmission)
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
      (pkg) => normalizedFuel(pkg.fuelType) === selectedFuelType && pkg.transmission === selectedTransmission
    );
  }, [packages, selectedFuelType, selectedTransmission]);

  useEffect(() => {
    if (!packages.length) {
      setSelectedMonthlyKm(null);
      return;
    }
    if (selectedMonthlyKm === null) setSelectedMonthlyKm(1000);
  }, [packages.length, selectedMonthlyKm]);

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
  const selectedVariant =
    hasSelectableCombination && selectedFuelType && selectedTransmission && selectedMonthlyKm && selectedPrice
      ? {
          fuelType: selectedFuelType as FuelType,
          transmission: selectedTransmission as TransmissionType,
          monthlyKm: selectedMonthlyKm,
          monthlyPrice: selectedPrice
        }
      : null;
  const detailQuoteHref = buildWhatsAppUrl(
    getWhatsappNumberByChannel(content.contact, "fleet"),
    buildQuoteMessage({
      locale,
      serviceType: "fleet",
      rentalStartDate: dateError ? undefined : rentalStartDate,
      vehicle: {
        brand: vehicle.brand,
        model: vehicle.model,
        modelYearLabel: vehicle.modelYearLabel,
        primaryCategory: vehicle.primaryCategory,
        secondaryCategories: vehicle.secondaryCategories
      },
      variant: selectedVariant || undefined
    })
  );

  const infoText = locale === "tr" ? vehicle.infoTr : vehicle.infoEn;
  const vatPerMonthLabel = locale === "tr" ? "+ KDV / AY" : "+ VAT / MONTH";

  return (
    <RevealOnScroll>
      <article className="premium-card rounded-xl border border-navy-900/12 bg-white p-4 shadow-lg transition duration-300 hover:shadow-xl sm:p-5 lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)_280px] lg:items-stretch">
          <div className="overflow-hidden rounded-xl border border-navy-900/12 bg-cloud-50">
            <VehicleMediaGallery
              title={`${vehicle.brand} ${vehicle.model}`}
              images={mediaImages}
              carouselActive={mediaImages.length > 1}
              carouselSpeed={vehicle.carouselSpeed || "normal"}
              onOpen={(index) => {
                setDetailInitialIndex(index);
                setIsDetailModalOpen(true);
              }}
            />
          </div>

          <div className="min-w-0 space-y-4">
            <div className="space-y-2">
              <button type="button" onClick={() => setIsDetailModalOpen(true)} className="text-left">
                <h3 className="text-[1.7rem] font-extrabold uppercase tracking-[0.03em] text-navy-900 transition hover:text-gold-700 sm:text-[1.95rem]">
                  {vehicle.brand} {vehicle.model}
                </h3>
              </button>
              <p className="text-[1rem] font-semibold text-navy-900/82">
                {locale === "tr" ? "Model Yılı" : "Model Year"}: {vehicle.modelYearLabel || "2024+"}
              </p>
              <p className="text-[1.03rem] leading-8 text-navy-900/86">
                {infoText?.trim()
                  ? infoText
                  : locale === "tr"
                    ? "Bu araçla ilgili detaylı bilgi yakında eklenecek."
                    : "Detailed vehicle information will be added soon."}
              </p>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(true)}
                className="text-base font-semibold text-gold-700 underline underline-offset-2 transition hover:text-gold-600"
              >
                {locale === "tr" ? "Detayları Gör" : "View Details"}
              </button>
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
                  <span className="text-[1rem] font-semibold text-navy-900/86">{t(locale, "fuelType")}</span>
                  <select
                    value={selectedFuelType ?? ""}
                    onChange={(event) => setSelectedFuelType(event.target.value as Exclude<FuelType, "Elektrik">)}
                    className="h-12 w-full rounded-lg border border-navy-900/20 bg-white px-3 text-base font-semibold text-navy-900"
                  >
                    {fuelOptions.map((fuelType) => (
                      <option key={fuelType} value={fuelType}>
                        {fuelTypeLabel(fuelType, locale)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-[1rem] font-semibold text-navy-900/86">{t(locale, "transmission")}</span>
                  <select
                    value={selectedTransmission ?? ""}
                    onChange={(event) => setSelectedTransmission(event.target.value as TransmissionType)}
                    className="h-12 w-full rounded-lg border border-navy-900/20 bg-white px-3 text-base font-semibold text-navy-900"
                  >
                    {transmissionOptions.map((transmission) => (
                      <option key={transmission} value={transmission}>
                        {transmissionLabel(transmission, locale)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-[1rem] font-semibold text-navy-900/86">{t(locale, "monthlyKm")}</span>
                  <select
                    value={selectedMonthlyKm ?? ""}
                    onChange={(event) => setSelectedMonthlyKm(Number(event.target.value) as KmOption)}
                    className="h-12 w-full rounded-lg border border-navy-900/20 bg-white px-3 text-base font-semibold text-navy-900"
                  >
                    {KM_OPTIONS.map((monthlyKm) => (
                      <option key={monthlyKm} value={monthlyKm}>
                        {monthlyKm.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")} KM
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-navy-900/20 bg-cloud-50 px-4 py-3 text-sm font-semibold text-navy-900/70">
                {locale === "tr" ? "Kiralama fiyatları yakında eklenecek." : "Rental prices will be added soon."}
              </div>
            )}

            {hasPackages ? (
              <label className="block max-w-md space-y-1.5 rounded-xl border border-navy-900/12 bg-cloud-50 p-3">
                <span className="text-[0.97rem] font-semibold text-navy-900/82">
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
                  className="h-12 w-full rounded-lg border border-navy-900/20 bg-white px-3 text-base font-semibold text-navy-900 outline-none transition focus:border-gold-500"
                />
                {dateError ? <p className="text-xs font-medium text-red-600">{dateError}</p> : null}
              </label>
            ) : null}
          </div>

          <div className="flex h-full flex-col rounded-xl border border-navy-900/10 bg-white p-5 shadow-lg">
              <p className="text-[1.05rem] font-semibold text-navy-900/84">{t(locale, "monthlyPrice")}</p>
            {hasSelectableCombination ? (
              <>
                <p className="mt-1 text-[2.2rem] font-extrabold leading-none tracking-tight text-navy-950">
                  {currencyTl(selectedPrice as number, locale)}
                </p>
                <p className="mt-1 text-[1.02rem] font-semibold text-navy-900/88">{vatPerMonthLabel}</p>
              </>
            ) : hasPackages ? (
              <p className="mt-3 text-sm font-semibold text-red-700">
                {locale === "tr" ? "Bu kombinasyon için fiyat tanımlanmamış." : "No price defined for this combination."}
              </p>
            ) : (
              <p className="mt-3 text-sm font-semibold text-navy-900/70">
                {locale === "tr" ? "Fiyat bilgisi yakında eklenecek." : "Price information will be added soon."}
              </p>
            )}

            <span className="mt-3 inline-flex w-fit rounded-full border border-gold-400/55 bg-gold-50 px-3 py-1 text-xs font-bold text-gold-700">
              {locale === "tr" ? "Sabit Fiyat Garantisi" : "Fixed Price Guarantee"}
            </span>

            <div className="mt-4">
              {hasSelectableCombination ? (
                <QuoteButton
                  className="w-full justify-center px-4 py-3 text-base"
                  serviceType="fleet"
                  rentalStartDate={dateError ? undefined : rentalStartDate}
                  vehicle={vehicle}
                  variant={selectedVariant || undefined}
                  showFormButton={false}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-full bg-slate-300 px-4 py-3 text-base font-bold text-slate-700 disabled:cursor-not-allowed"
                >
                  OPSİYONLA
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsDetailModalOpen(true)}
              className="mt-3 inline-flex w-fit text-sm font-semibold text-navy-700 underline underline-offset-2 transition hover:text-navy-900"
            >
              {locale === "tr" ? "Detayları Gör" : "View Details"}
            </button>

            <a
              href={buildWhatsAppUrl(getWhatsappNumberByChannel(content.contact, "fleet"), buildZeroKmQuoteMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm font-semibold text-navy-700 underline-offset-2 transition hover:text-navy-900 hover:underline"
            >
              {locale === "tr" ? "0 KM Araçlar İçin Teklif Al" : "Get Quote for 0 KM Vehicles"}
            </a>

            <p className="mt-3 rounded-lg border border-gold-500/35 bg-gold-50 px-3 py-2 text-sm leading-relaxed text-navy-900/90">
              {locale === "tr" ? (
                <>
                  Teknik şartname için{" "}
                  <a
                    href={FLEET_TERMS_PDF_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-extrabold text-gold-700 underline underline-offset-2 transition hover:text-gold-600"
                  >
                    buradan
                  </a>{" "}
                  ulaşabilirsiniz.
                </>
              ) : (
                <>
                  You can access the technical specification{" "}
                  <a
                    href={FLEET_TERMS_PDF_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gold-700 underline underline-offset-2 transition hover:text-gold-600"
                  >
                    here
                  </a>
                  .
                </>
              )}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-navy-900/72">
              {locale === "tr"
                ? "Fiyatlarımız min. 6-12-24 ay kiralama için geçerlidir."
                : "Our pricing applies to minimum 6-12-24 month rentals."}
            </p>
          </div>
        </div>

        <VehicleDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          vehicle={vehicle}
          locale={locale}
          images={mediaImages}
          initialIndex={detailInitialIndex}
          selectedFuelType={selectedFuelType as FuelType | null}
          selectedTransmission={selectedTransmission as TransmissionType | null}
          selectedMonthlyKm={selectedMonthlyKm as RentalKm | null}
          selectedPrice={selectedPrice}
          fleetInformation={content.fleetInformation}
          quoteHref={detailQuoteHref}
          canQuote={hasSelectableCombination}
        />
      </article>
    </RevealOnScroll>
  );
}
