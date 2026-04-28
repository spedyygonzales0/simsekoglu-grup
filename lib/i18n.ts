import {
  Locale,
  ProjectStatus,
  QuoteRequestStatus,
  ServiceType,
  TranslationMap,
  VariantAvailabilityStatus,
  VehicleCategory
} from "@/lib/types";

export const dictionary: TranslationMap = {
  home: { tr: "Ana Sayfa", en: "Home" },
  about: { tr: "Hakkımızda", en: "About" },
  construction: { tr: "İnşaat", en: "Construction" },
  architecture: { tr: "Mimarlık", en: "Architecture" },
  fleet: { tr: "Araç Kiralama", en: "Fleet Rental" },
  projects: { tr: "Projeler", en: "Projects" },
  contact: { tr: "İletişim", en: "Contact" },
  quote: { tr: "Teklif Al", en: "Get a Quote" },
  featuredProjects: { tr: "Öne Çıkan Projeler", en: "Featured Projects" },
  featuredVehicles: { tr: "Öne Çıkan Araçlar", en: "Featured Vehicles" },
  monthlyPrice: { tr: "Aylık Fiyat", en: "Monthly Price" },
  monthlyKm: { tr: "Aylık KM", en: "Monthly KM" },
  modelYear: { tr: "Model Yılı", en: "Model Year" },
  fuelType: { tr: "Yakıt Türü", en: "Fuel Type" },
  transmission: { tr: "Vites", en: "Transmission" },
  businessAreas: { tr: "Faaliyet Alanları", en: "Business Areas" },
  send: { tr: "Gönder", en: "Send" },
  all: { tr: "Tümü", en: "All" },
  phone: { tr: "Telefon", en: "Phone" },
  email: { tr: "E-posta", en: "Email" },
  address: { tr: "Adres", en: "Address" },
  map: { tr: "Harita", en: "Map" },
  contactForm: { tr: "İletişim Formu", en: "Contact Form" },
  requestForm: { tr: "Teklif Formu", en: "Quote Form" },
  vehicleList: { tr: "Araç Listesi", en: "Vehicle List" },
  sortByPrice: { tr: "Fiyata Göre Sırala", en: "Sort by Price" },
  lowToHigh: { tr: "Artan", en: "Low to High" },
  highToLow: { tr: "Azalan", en: "High to Low" },
  status: { tr: "Durum", en: "Status" },
  active: { tr: "Aktif", en: "Active" },
  passive: { tr: "Pasif", en: "Passive" },
  dashboard: { tr: "Panel", en: "Dashboard" }
};

export function t(locale: Locale, key: keyof typeof dictionary): string {
  return dictionary[key][locale];
}

export function currencyTl(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(amount);
}

export function vehicleCategoryLabel(category: VehicleCategory, locale: Locale): string {
  const map: Record<VehicleCategory, { tr: string; en: string }> = {
    suv: { tr: "SUV", en: "SUV" },
    electric: { tr: "Elektrikli", en: "Electric" },
    economy: { tr: "Ekonomi", en: "Economy" },
    luxury: { tr: "Lüks", en: "Luxury" },
    commercial: { tr: "Ticari", en: "Commercial" },
    sedan: { tr: "Sedan", en: "Sedan" },
    hatchback: { tr: "Hatchback", en: "Hatchback" },
    van: { tr: "Van", en: "Van" }
  };

  return map[category][locale];
}

export function availabilityLabel(status: VariantAvailabilityStatus, locale: Locale): string {
  const map: Record<VariantAvailabilityStatus, { tr: string; en: string }> = {
    available: { tr: "Müsait", en: "Available" },
    limited: { tr: "Sınırlı", en: "Limited" },
    unavailable: { tr: "Müsait Değil", en: "Unavailable" }
  };

  return map[status][locale];
}

export function projectStatusLabel(status: ProjectStatus, locale: Locale): string {
  const map: Record<ProjectStatus, { tr: string; en: string }> = {
    completed: { tr: "Tamamlandı", en: "Completed" },
    ongoing: { tr: "Devam Ediyor", en: "Ongoing" },
    planned: { tr: "Planlandı", en: "Planned" }
  };

  return map[status][locale];
}

export function requestStatusLabel(status: QuoteRequestStatus, locale: Locale): string {
  const map: Record<QuoteRequestStatus, { tr: string; en: string }> = {
    pending: { tr: "Yeni", en: "New" },
    contacted: { tr: "Görüşüldü", en: "Contacted" },
    closed: { tr: "Kapandı", en: "Closed" }
  };

  return map[status][locale];
}

export function serviceTypeLabel(serviceType: ServiceType, locale: Locale): string {
  const map: Record<ServiceType, { tr: string; en: string }> = {
    construction: { tr: "İnşaat", en: "Construction" },
    architecture: { tr: "Mimarlık", en: "Architecture" },
    fleet: { tr: "Araç Kiralama", en: "Fleet Rental" }
  };

  return map[serviceType][locale];
}
