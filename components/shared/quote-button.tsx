"use client";

import { useMemo } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { buildQuoteMessage, buildWhatsAppUrl } from "@/lib/data/whatsapp";
import { ServiceType, Vehicle, VehicleVariant } from "@/lib/types";

interface QuoteButtonProps {
  className?: string;
  serviceType?: ServiceType;
  selectedLabel?: string;
  selectedProjectId?: string;
  rentalStartDate?: string;
  vehicle?: Vehicle;
  variant?: VehicleVariant;
}

export function QuoteButton({
  className = "",
  serviceType = "construction",
  selectedLabel,
  selectedProjectId,
  rentalStartDate,
  vehicle,
  variant
}: QuoteButtonProps) {
  const { locale, content, openQuoteModal } = useSiteData();

  const whatsappHref = useMemo(() => {
    const message = buildQuoteMessage({
      locale,
      serviceType,
      selectedLabel,
      rentalStartDate,
      vehicle: vehicle
        ? {
            brand: vehicle.brand,
            model: vehicle.model,
            primaryCategory: vehicle.primaryCategory,
            secondaryCategories: vehicle.secondaryCategories
          }
        : undefined,
      variant: variant
        ? {
            title: variant.title,
            fuelType: variant.fuelType,
            transmission: variant.transmission,
            modelYear: variant.modelYear,
            monthlyKm: variant.monthlyKm,
            monthlyPrice: variant.monthlyPrice
          }
        : undefined
    });

    return buildWhatsAppUrl(content.contact.whatsapp, message);
  }, [content.contact.whatsapp, locale, rentalStartDate, selectedLabel, serviceType, variant, vehicle]);

  return (
    <div className="flex items-center gap-2">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className={`premium-btn inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-bold tracking-wide text-navy-900 hover:bg-gold-400 ${className}`}
      >
        {serviceType === "fleet"
          ? locale === "tr"
            ? "WhatsApp'tan Teklif Al"
            : "Get Quote on WhatsApp"
          : locale === "tr"
            ? content.home.ctaTr
            : content.home.ctaEn}
      </a>
      <button
        type="button"
        onClick={() =>
          openQuoteModal({
            serviceType,
            selectedProjectId,
            selectedProjectLabel: serviceType !== "fleet" ? selectedLabel : undefined,
            selectedVehicleSlug: vehicle?.slug,
            selectedVehicleLabel: vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined,
            selectedVariantId: variant?.variantId,
            selectedVariantLabel: variant?.title
          })
        }
        className="premium-btn inline-flex items-center justify-center rounded-full border border-navy-900/20 px-5 py-3 text-sm font-semibold text-navy-900 hover:border-gold-500 hover:text-gold-500"
      >
        {locale === "tr" ? "Form" : "Form"}
      </button>
    </div>
  );
}
