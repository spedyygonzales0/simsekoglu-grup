import { currencyTl, fuelTypeLabel, serviceTypeLabel, transmissionLabel } from "@/lib/i18n";
import { ContactInfo, FuelType, Locale, ServiceType, TransmissionType, VehicleCategory } from "@/lib/types";

interface VehicleContext {
  brand: string;
  model: string;
  modelYearLabel?: string;
  primaryCategory: VehicleCategory;
  secondaryCategories: VehicleCategory[];
}

interface VariantContext {
  title?: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  monthlyKm: number;
  monthlyPrice: number;
}

interface QuoteMessageParams {
  locale: Locale;
  serviceType: "construction" | "architecture" | "fleet";
  selectedLabel?: string;
  rentalStartDate?: string;
  vehicle?: VehicleContext;
  variant?: VariantContext;
}

export type WhatsappChannel = ServiceType | "general";

export function sanitizeWhatsappNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) return `90${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const safeNumber = sanitizeWhatsappNumber(number);
  return `https://wa.me/${safeNumber}?text=${encodeURIComponent(message)}`;
}

export function getWhatsappNumberByChannel(contact: ContactInfo, channel: WhatsappChannel): string {
  const general =
    contact.whatsappGeneral?.trim() || contact.whatsapp?.trim() || contact.whatsappFleet?.trim() || "";

  if (channel === "fleet") return contact.whatsappFleet?.trim() || general;
  if (channel === "construction") return contact.whatsappConstruction?.trim() || general;
  if (channel === "architecture") return contact.whatsappArchitecture?.trim() || general;
  return general;
}

export function buildQuoteMessage(params: QuoteMessageParams): string {
  const { locale, serviceType, selectedLabel, rentalStartDate, vehicle, variant } = params;

  if (serviceType === "fleet" && vehicle && variant) {
    const rentalStartDateLabel =
      rentalStartDate?.trim() || (locale === "tr" ? "Belirtilmedi" : "Not specified");

    if (locale === "en") {
      return [
        "Hello, I would like to get a fleet rental quote from Simsekoglu Group website.",
        "",
        `Vehicle: ${vehicle.brand} ${vehicle.model}`,
        `Model Year: ${vehicle.modelYearLabel || "2024+"}`,
        `Fuel: ${fuelTypeLabel(variant.fuelType, "en")}`,
        `Transmission: ${transmissionLabel(variant.transmission, "en")}`,
        `Monthly KM: ${variant.monthlyKm}`,
        `Monthly Price: ${currencyTl(variant.monthlyPrice, locale)}`,
        "+ VAT / MONTH",
        `Rental Start Date: ${rentalStartDateLabel}`,
        "",
        "Full Name:",
        "Phone:",
        "Note:"
      ].join("\n");
    }

    return [
      "Merhaba, Şimşekoğlu Grup web sitesinden araç kiralama teklifi almak istiyorum.",
      "",
      `Araç: ${vehicle.brand} ${vehicle.model}`,
      `Model Yılı: ${vehicle.modelYearLabel || "2024+"}`,
      `Yakıt: ${variant.fuelType}`,
      `Vites: ${variant.transmission}`,
      `Aylık KM: ${variant.monthlyKm}`,
      `Aylık Fiyat: ${currencyTl(variant.monthlyPrice, locale)}`,
      "+ KDV / AY",
      `Kiralama Başlangıç Tarihi: ${rentalStartDateLabel}`,
      "",
      "Ad Soyad:",
      "Telefon:",
      "Not:"
    ].join("\n");
  }

  if (serviceType === "construction") {
    if (locale === "en") {
      return [
        "Hello, I would like to get a quote for construction services from Simsekoglu Group website.",
        "",
        "Service: Construction",
        "Project Type:",
        "Location:",
        "Estimated m²:",
        "Note:"
      ].join("\n");
    }

    return [
      "Merhaba, Şimşekoğlu Grup web sitesinden inşaat hizmetleri için teklif almak istiyorum.",
      "",
      "Hizmet: İnşaat",
      "Proje Türü:",
      "Konum:",
      "Tahmini m²:",
      "Not:"
    ].join("\n");
  }

  if (serviceType === "architecture") {
    if (locale === "en") {
      return [
        "Hello, I would like to get a quote for architecture services from Simsekoglu Group website.",
        "",
        "Service: Architecture",
        "Request: Interior architecture / Exterior architecture / Project drawing",
        "Location:",
        "Estimated m²:",
        "Note:"
      ].join("\n");
    }

    return [
      "Merhaba, Şimşekoğlu Grup web sitesinden mimarlık hizmetleri için teklif almak istiyorum.",
      "",
      "Hizmet: Mimarlık",
      "Talep: İç mimarlık / Dış mimarlık / Proje çizimi",
      "Konum:",
      "Tahmini m²:",
      "Not:"
    ].join("\n");
  }

  if (locale === "en") {
    return [
      `Hello, I would like to get a ${serviceTypeLabel(serviceType, locale)} quote from Simsekoglu Group website.`,
      selectedLabel ? `Selected: ${selectedLabel}` : "",
      "",
      "Full Name:",
      "Phone:",
      "Email:",
      "Message:"
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Merhaba, Şimşekoğlu Grup web sitesinden ${serviceTypeLabel(serviceType, locale)} teklifi almak istiyorum.`,
    selectedLabel ? `Seçilen: ${selectedLabel}` : "",
    "",
    "Ad Soyad:",
    "Telefon:",
    "E-posta:",
    "Mesaj:"
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildZeroKmQuoteMessage(): string {
  return [
    "Merhaba, Şimşekoğlu Grup web sitesinden 0 KM araç için teklif almak istiyorum.",
    "",
    "Araç Markası:",
    "Araç Modeli:",
    "Talep Edilen Adet:",
    "Not:"
  ].join("\n");
}


