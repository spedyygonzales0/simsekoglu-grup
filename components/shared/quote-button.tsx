"use client";

import { useMemo } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { buildQuoteMessage, buildWhatsAppUrl, getWhatsappNumberByChannel } from "@/lib/data/whatsapp";
import { FuelType, ServiceType, TransmissionType, Vehicle } from "@/lib/types";

interface SelectedRentalOption {
  fuelType: FuelType;
  transmission: TransmissionType;
  monthlyKm: number;
  monthlyPrice: number;
}

interface QuoteButtonProps {
  className?: string;
  serviceType?: ServiceType;
  selectedLabel?: string;
  selectedProjectId?: string;
  rentalStartDate?: string;
  vehicle?: Vehicle;
  variant?: SelectedRentalOption;
  showFormButton?: boolean;
}

export function QuoteButton({
  className = "",
  serviceType = "construction",
  selectedLabel,
  selectedProjectId,
  rentalStartDate,
  vehicle,
  variant,
  showFormButton = true
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
            modelYearLabel: vehicle.modelYearLabel,
            primaryCategory: vehicle.primaryCategory,
            secondaryCategories: vehicle.secondaryCategories
          }
        : undefined,
      variant: variant
        ? {
            fuelType: variant.fuelType,
            transmission: variant.transmission,
            monthlyKm: variant.monthlyKm,
            monthlyPrice: variant.monthlyPrice
          }
        : undefined
    });

    const targetNumber = getWhatsappNumberByChannel(content.contact, serviceType);
    return buildWhatsAppUrl(targetNumber, message);
  }, [content.contact, locale, rentalStartDate, selectedLabel, serviceType, variant, vehicle]);

  return (
    <div className="flex items-center gap-2">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`premium-btn button-text inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 tracking-[0.02em] text-navy-900 hover:bg-gold-400 ${className}`}
      >
        {serviceType === "fleet"
          ? "OPSİYONLA"
          : locale === "tr"
            ? content.home.ctaTr
            : content.home.ctaEn}
      </a>
      {showFormButton ? (
        <button
          type="button"
          onClick={() =>
            openQuoteModal({
              serviceType,
              selectedProjectId,
              selectedProjectLabel: serviceType !== "fleet" ? selectedLabel : undefined,
              selectedVehicleSlug: vehicle?.slug,
              selectedVehicleLabel: vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined,
              selectedVariantId: undefined,
              selectedVariantLabel: variant
                ? `${variant.fuelType} / ${variant.transmission} / ${variant.monthlyKm} KM`
                : undefined
            })
          }
          className="premium-btn button-text inline-flex items-center justify-center rounded-full border border-navy-900/20 px-5 py-3 text-navy-900 hover:border-gold-500 hover:text-gold-500"
        >
          {locale === "tr" ? "Form" : "Form"}
        </button>
      ) : null}
    </div>
  );
}
