"use client";

import { useMemo, useState } from "react";
import { VehicleMediaGallery } from "@/components/fleet/vehicle-media-gallery";
import { QuoteButton } from "@/components/shared/quote-button";
import { RevealOnScroll } from "@/components/shared/reveal-on-scroll";
import { useSiteData } from "@/components/providers/site-data-provider";
import { availabilityLabel, currencyTl, t, vehicleCategoryLabel } from "@/lib/i18n";
import { Vehicle } from "@/lib/types";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { locale } = useSiteData();
  const [selectedVariantId, setSelectedVariantId] = useState(vehicle.variants[0]?.variantId || "");
  const [rentalStartDate, setRentalStartDate] = useState("");
  const [dateError, setDateError] = useState("");

  const selectedVariant = useMemo(
    () => vehicle.variants.find((variant) => variant.variantId === selectedVariantId) ?? vehicle.variants[0],
    [selectedVariantId, vehicle.variants]
  );

  const mediaImages = useMemo(
    () => Array.from(new Set([vehicle.mainImage, ...(vehicle.galleryImages || [])].filter(Boolean))),
    [vehicle.galleryImages, vehicle.mainImage]
  );
  const minRentalDate = useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }, []);

  if (!selectedVariant) return null;

  const categoryTags = [vehicle.primaryCategory, ...vehicle.secondaryCategories];

  return (
    <RevealOnScroll>
      <article className="premium-card glass-card overflow-hidden">
          <VehicleMediaGallery
            title={`${vehicle.brand} ${vehicle.model}`}
            images={mediaImages}
            carouselActive={vehicle.carouselActive}
            carouselSpeed={vehicle.carouselSpeed}
          />

          <div className="space-y-5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold uppercase tracking-[0.03em] text-navy-900">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categoryTags.map((category) => (
                    <span
                      key={`${vehicle.id}-${category}`}
                      className="rounded-full border border-gold-500/35 bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-700"
                    >
                      {vehicleCategoryLabel(category, locale)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {vehicle.featured ? (
                  <span className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-700">
                    Featured
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    vehicle.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {vehicle.active ? t(locale, "active") : t(locale, "passive")}
                </span>
              </div>
            </div>

            {vehicle.variants.length > 1 ? (
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-900/65">
                  {locale === "tr" ? "Versiyon" : "Variant"}
                </span>
                <select
                  value={selectedVariant.variantId}
                  onChange={(event) => setSelectedVariantId(event.target.value)}
                  className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2 text-sm font-semibold text-navy-900"
                >
                  {vehicle.variants.map((variant) => (
                    <option key={variant.variantId} value={variant.variantId}>
                      {variant.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="rounded-xl border border-navy-900/10 bg-cloud-50 p-4">
              <p className="text-sm font-bold text-navy-900">{selectedVariant.title}</p>
              <p className="mt-1 text-xs font-medium text-navy-900/60">
                {availabilityLabel(selectedVariant.availabilityStatus, locale)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-navy-900/85">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-900/55">
                    {t(locale, "fuelType")}
                  </p>
                  <p className="font-semibold">{selectedVariant.fuelType}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-900/55">
                    {t(locale, "transmission")}
                  </p>
                  <p className="font-semibold">{selectedVariant.transmission}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-900/55">
                    {t(locale, "modelYear")}
                  </p>
                  <p className="font-semibold">{selectedVariant.modelYear}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-900/55">
                    {t(locale, "monthlyKm")}
                  </p>
                  <p className="font-semibold">
                    {selectedVariant.monthlyKm.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")} km
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-navy-900/10 bg-white p-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-900/60">
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
                  className="w-full rounded-lg border border-navy-900/20 bg-cloud-50 px-3 py-2 text-sm font-semibold text-navy-900 outline-none transition focus:border-gold-500"
                />
              </label>
              {dateError ? <p className="mt-2 text-xs font-medium text-red-600">{dateError}</p> : null}
              <p className="mt-2 text-xs text-navy-900/55">
                {locale === "tr"
                  ? "Tarih seçmezseniz mesajda 'Belirtilmedi' olarak gönderilir."
                  : "If not selected, it will be sent as 'Not specified' in WhatsApp message."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-900/55">
                  {t(locale, "monthlyPrice")}
                </p>
                <p className="text-3xl font-extrabold text-navy-900">
                  {currencyTl(selectedVariant.monthlyPrice, locale)}
                </p>
              </div>

              <QuoteButton
                className="px-4 py-2 text-xs shadow-[0_8px_20px_-12px_rgba(199,155,74,0.95)]"
                serviceType="fleet"
                rentalStartDate={dateError ? undefined : rentalStartDate}
                vehicle={vehicle}
                variant={selectedVariant}
              />
            </div>
          </div>
      </article>
    </RevealOnScroll>
  );
}
