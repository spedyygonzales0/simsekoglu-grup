"use client";

import { defaultSiteContent } from "@/lib/data/default-site-content";
import { defaultFleetInformation } from "@/lib/data/fleet-information-default";
import { getFleetMediaBySlug } from "@/lib/data/fleet-vehicle-catalog";
import { CATEGORY_DEFAULT_MEDIA, ensureFleetImage, getSafeProjectImage, getSafeProjectVideo, isFleetImage } from "@/lib/data/image-map";
import {
  createVehicle as createVehicleRecord,
  deleteVehicle as deleteVehicleRecord,
  getVehicles as getVehicleRecords,
  updateVehicle as updateVehicleRecord
} from "@/lib/services/vehicle-service";
import {
  getFleetInformation as getFleetInformationRecord,
  updateFleetInformation as updateFleetInformationRecord
} from "@/lib/services/fleet-information-service";
import {
  getSettings as getSettingsRecord,
  updateSettings as updateSettingsRecord
} from "@/lib/services/settings-service";
import {
  clearLegacyUserStorage,
  readLocale,
  readQuoteRequests,
  readSiteContent,
  writeLocale,
  writeQuoteRequests,
  writeSiteContent
} from "@/lib/storage/client";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import {
  AboutContent,
  AdminSession,
  ArchitectureContent,
  CarouselSpeed,
  ConstructionContent,
  ContactInfo,
  FuelType,
  FleetInformationContent,
  HomeContent,
  Locale,
  Project,
  ProjectStatus,
  ProjectCardTextGroups,
  QuoteRequest,
  QuoteRequestStatus,
  RentalPackage,
  ServiceType,
  SettingsContent,
  SiteContent,
  TransmissionType,
  VariantAvailabilityStatus,
  Vehicle,
  VehicleCategory,
  VehicleVariant
} from "@/lib/types";
import { createContext, useContext, useEffect, useState } from "react";

interface QuoteModalDefaults {
  serviceType?: ServiceType;
  selectedVehicleSlug?: string;
  selectedVehicleLabel?: string;
  selectedVariantId?: string;
  selectedVariantLabel?: string;
  selectedProjectId?: string;
  selectedProjectLabel?: string;
}

interface CreateQuotePayload {
  name: string;
  phone: string;
  email: string;
  serviceType: ServiceType;
  selectedVehicleSlug?: string;
  selectedVehicleLabel?: string;
  selectedVariantId?: string;
  selectedVariantLabel?: string;
  selectedProjectId?: string;
  selectedProjectLabel?: string;
  message: string;
}

interface SiteDataContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  content: SiteContent;
  isHydrated: boolean;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, updated: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateContact: (contact: ContactInfo) => void;
  updateHome: (home: HomeContent) => void;
  updateAbout: (about: AboutContent) => void;
  updateConstruction: (construction: ConstructionContent) => void;
  updateArchitecture: (architecture: ArchitectureContent) => void;
  updateFleetInformation: (fleetInformation: FleetInformationContent) => void;
  updateProjectCardTexts: (
    section: keyof ProjectCardTextGroups,
    nextValues: Record<string, ProjectCardTextGroups[keyof ProjectCardTextGroups][string]>
  ) => void;
  updateSettings: (settings: SettingsContent) => void;
  updateMediaLibrary: (items: string[]) => void;
  adminSession: AdminSession | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logoutAdmin: () => void;
  quoteRequests: QuoteRequest[];
  createQuoteRequest: (payload: CreateQuotePayload) => { ok: boolean; message: string };
  updateQuoteRequestStatus: (id: string, status: QuoteRequestStatus) => void;
  deleteQuoteRequest: (id: string) => void;
  openQuoteModal: (defaults?: QuoteModalDefaults) => void;
  closeQuoteModal: () => void;
  quoteModalState: {
    isOpen: boolean;
    defaults: QuoteModalDefaults;
  };
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

const VEHICLE_CATEGORIES: VehicleCategory[] = [
  "suv",
  "electric",
  "economy",
  "luxury",
  "commercial",
  "sedan",
  "hatchback",
  "van"
];

const FUEL_TYPES: FuelType[] = ["Benzin", "Dizel", "Hibrit", "Elektrik", "Elektrikli"];
const TRANSMISSION_TYPES: TransmissionType[] = ["Otomatik", "Manuel"];
const PROJECT_STATUS: ProjectStatus[] = ["completed", "ongoing", "planned"];
const CAROUSEL_SPEEDS: CarouselSpeed[] = ["slow", "normal", "fast"];
const MOCK_QUOTE_REQUESTS: QuoteRequest[] = [
  {
    id: "q-mock-1",
    name: "Ahmet Yılmaz",
    phone: "+90 532 000 11 22",
    email: "ahmet@example.com",
    serviceType: "fleet",
    selectedVehicleSlug: "bmw-i5-edrive40",
    selectedVehicleLabel: "BMW i5 eDrive40",
    selectedVariantId: "bmw-i5-2025-edrive40",
    selectedVariantLabel: "eDrive40 Executive",
    message: "Aylık 3000 KM limitli teklif almak istiyorum.",
    status: "pending",
    createdAt: "2026-04-23T09:30:00.000Z"
  },
  {
    id: "q-mock-2",
    name: "Elif Kaya",
    phone: "+90 533 222 33 44",
    email: "elif@example.com",
    serviceType: "construction",
    selectedProjectLabel: "Marmara Konut Kompleksi",
    message: "Konut projemiz için anahtar teslim inşaat teklifi talep ediyoruz.",
    status: "contacted",
    createdAt: "2026-04-21T14:10:00.000Z"
  },
  {
    id: "q-mock-3",
    name: "Can Demir",
    phone: "+90 544 777 88 99",
    email: "can@example.com",
    serviceType: "architecture",
    selectedProjectLabel: "Kurumsal Merkez Ofis Tasarımı",
    message: "Ofis iç mimari revizyonu için keşif talebi oluşturmak istiyorum.",
    status: "closed",
    createdAt: "2026-04-17T11:45:00.000Z"
  }
];

const DEFAULT_CONTACT_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1291.7876590941064!2d32.610087211323965!3d40.066781855509205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d3338ec7768c3f%3A0xa6b18625d699dbd8!2zxZ7EsE3FnkVLT8SeTFUgT1RPTU9UxLBWIEbEsExP!5e1!3m2!1str!2str!4v1777455274447!5m2!1str!2str";
const DEFAULT_CONTACT_MAP_LINK_URL = "https://maps.app.goo.gl/TdHCzQVZe4N8qLrV9";

function isEmbeddableGoogleMap(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("google.") && parsed.pathname.includes("/maps/embed");
  } catch {
    return false;
  }
}

function sanitizePlainText(value: unknown, maxLength = 4000): string {
  const input = typeof value === "string" ? value : "";
  const cleaned = input
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, maxLength);
}

function sanitizeMultilineText(value: unknown, maxLength = 12000): string {
  const input = typeof value === "string" ? value : "";
  const cleaned = input
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
  return cleaned.slice(0, maxLength);
}

function sanitizePhoneLike(value: unknown): string {
  const input = typeof value === "string" ? value : "";
  return input.replace(/[^\d+]/g, "").slice(0, 20);
}

type LegacyVehicle = Partial<Vehicle> & {
  brandModel?: string;
  modelYearLabel?: string;
  type?: string;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  modelYear?: number;
  monthlyKm?: number;
  monthlyKmLimit?: number;
  monthlyPrice?: number;
  deposit?: number;
  availabilityStatus?: VariantAvailabilityStatus;
  notes?: string;
  imageUrl?: string;
  variants?: Partial<VehicleVariant>[];
  rentalPackages?: Partial<RentalPackage>[];
};

type LegacyProject = Partial<Project>;

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function asVehicleCategory(value: string | undefined, fallback: VehicleCategory): VehicleCategory {
  if (value && VEHICLE_CATEGORIES.includes(value as VehicleCategory)) return value as VehicleCategory;
  return fallback;
}

function asFuelType(value: string | undefined, fallback: FuelType): FuelType {
  if (value === "Elektrik") return "Elektrikli";
  if (value && FUEL_TYPES.includes(value as FuelType)) return value as FuelType;
  return fallback;
}

function asTransmission(value: string | undefined, fallback: TransmissionType): TransmissionType {
  if (value && TRANSMISSION_TYPES.includes(value as TransmissionType)) return value as TransmissionType;
  return fallback;
}

function asProjectStatus(value: string | undefined): ProjectStatus {
  if (value && PROJECT_STATUS.includes(value as ProjectStatus)) return value as ProjectStatus;
  return "planned";
}

function asCarouselSpeed(value: string | undefined): CarouselSpeed {
  if (value && CAROUSEL_SPEEDS.includes(value as CarouselSpeed)) return value as CarouselSpeed;
  return "normal";
}

function createEmptyPriceMap(): RentalPackage["prices"] {
  return {
    1000: null,
    2000: null,
    3000: null
  };
}

function normalizePackagePrice(value: unknown): number | null {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

function normalizeRentalPackage(source: Partial<RentalPackage>, index: number): RentalPackage {
  const normalizedFuel = asFuelType(source.fuelType, "Benzin");
  return {
    id: source.id?.trim() || generateId(`pkg${index + 1}`),
    fuelType: normalizedFuel === "Elektrik" ? "Elektrikli" : normalizedFuel,
    transmission: asTransmission(source.transmission, "Otomatik"),
    prices: {
      1000: normalizePackagePrice(source.prices?.[1000]),
      2000: normalizePackagePrice(source.prices?.[2000]),
      3000: normalizePackagePrice(source.prices?.[3000])
    }
  };
}

function variantsToRentalPackages(variants: Partial<VehicleVariant>[]): RentalPackage[] {
  const grouped = new Map<string, RentalPackage>();
  variants.forEach((variant, index) => {
    const fuel = asFuelType(variant.fuelType, "Benzin");
    const normalizedFuel = fuel === "Elektrik" ? "Elektrikli" : fuel;
    const transmission = asTransmission(variant.transmission, "Otomatik");
    const key = `${normalizedFuel}|${transmission}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        id: variant.variantId?.trim() || generateId(`pkgv${index + 1}`),
        fuelType: normalizedFuel,
        transmission,
        prices: createEmptyPriceMap()
      });
    }
    const monthlyKm = Number(variant.monthlyKm);
    const monthlyPrice = normalizePackagePrice(variant.monthlyPrice);
    if ((monthlyKm === 1000 || monthlyKm === 2000 || monthlyKm === 3000) && monthlyPrice !== null) {
      grouped.get(key)!.prices[monthlyKm] = monthlyPrice;
    }
  });
  return Array.from(grouped.values());
}

function normalizeVehicle(source: LegacyVehicle): Vehicle {
  const legacyType = source.type;
  const brandModel = source.brandModel?.trim() || "Araç";
  const [legacyBrand, ...legacyModelParts] = brandModel.split(" ");
  const legacyModel = legacyModelParts.join(" ").trim() || brandModel;

  const brand = source.brand?.trim() || legacyBrand || "Marka";
  const model = source.model?.trim() || legacyModel || "Model";
  const modelYearLabel = source.modelYearLabel?.trim() || "2024+";
  const slug = source.slug?.trim() || toSlug(`${brand}-${model}`);
  const defaultVehicleInfo = defaultSiteContent.vehicles.find((item) => item.slug === slug);
  const infoTr = source.infoTr?.trim() || defaultVehicleInfo?.infoTr || "";
  const infoEn = source.infoEn?.trim() || defaultVehicleInfo?.infoEn || "";
  const insuranceBenefitsTr = source.insuranceBenefitsTr?.trim() || defaultVehicleInfo?.insuranceBenefitsTr || "";
  const insuranceBenefitsEn = source.insuranceBenefitsEn?.trim() || defaultVehicleInfo?.insuranceBenefitsEn || "";
  const whyChooseFleetTr = source.whyChooseFleetTr?.trim() || defaultVehicleInfo?.whyChooseFleetTr || "";
  const whyChooseFleetEn = source.whyChooseFleetEn?.trim() || defaultVehicleInfo?.whyChooseFleetEn || "";
  const servicesText = source.servicesText?.trim() || defaultVehicleInfo?.servicesText || "";
  const termsText = source.termsText?.trim() || defaultVehicleInfo?.termsText || "";
  const userRulesText = source.userRulesText?.trim() || defaultVehicleInfo?.userRulesText || "";
  const officialUrl = source.officialUrl?.trim() || defaultVehicleInfo?.officialUrl || "";

  const primaryCategory = asVehicleCategory(source.primaryCategory ?? legacyType, "economy");
  const rawSecondary = Array.isArray(source.secondaryCategories)
    ? source.secondaryCategories
    : legacyType
      ? [legacyType]
      : [];

  const secondaryCategories = rawSecondary
    .map((value: string) => asVehicleCategory(value, primaryCategory))
    .filter((value: VehicleCategory, position: number, arr: VehicleCategory[]) => {
      if (value === primaryCategory) return false;
      return arr.indexOf(value) === position;
    });

  const legacyVariant: Partial<VehicleVariant> = {
    variantId: `${slug}-legacy`,
    title: "Standart",
    fuelType: source.fuelType,
    transmission: source.transmission,
    modelYear: source.modelYear,
    monthlyKm: source.monthlyKm ?? source.monthlyKmLimit,
    monthlyPrice: source.monthlyPrice,
    deposit: source.deposit,
    availabilityStatus: source.availabilityStatus,
    notes: source.notes
  };

  const variantsSource: Partial<VehicleVariant>[] = Array.isArray(source.variants)
    ? source.variants
    : source.monthlyPrice
      ? [legacyVariant]
      : [];

  const packageSource: Partial<RentalPackage>[] = Array.isArray(source.rentalPackages)
    ? source.rentalPackages
    : variantsToRentalPackages(variantsSource);

  const rentalPackages = packageSource
    .map((item, packageIndex) => normalizeRentalPackage(item, packageIndex))
    .filter((pkg) => pkg.id && pkg.fuelType && pkg.transmission);

  const mappedMedia = getFleetMediaBySlug(slug);
  const rawMainImage = source.mainImage || source.imageUrl || "";
  const rawGalleryImages = Array.isArray(source.galleryImages) ? source.galleryImages : [];
  const rawMediaCombined = [rawMainImage, ...rawGalleryImages].filter(Boolean);
  const hasFolderBasedMedia = rawMediaCombined.some(
    (path) => typeof path === "string" && path.includes("/aracresimleri/")
  );
  const shouldAutoUseFolderGallery = Boolean(mappedMedia) && !hasFolderBasedMedia;

  const resolvedMainImage = shouldAutoUseFolderGallery
    ? mappedMedia?.mainImage || rawMainImage
    : rawMainImage;
  const resolvedGalleryImages = shouldAutoUseFolderGallery
    ? mappedMedia?.galleryImages || rawGalleryImages
    : rawGalleryImages;

  const normalizedMainImage = ensureFleetImage(resolvedMainImage);
  const normalizedGalleryImages = resolvedGalleryImages
    .map((path: string) => ensureFleetImage(path))
    .filter(Boolean);
  const galleryWithMain = Array.from(new Set([normalizedMainImage, ...normalizedGalleryImages]));

  return {
    id: source.id?.trim() || generateId("v"),
    brand,
    model,
    modelYearLabel,
    slug,
    primaryCategory,
    secondaryCategories,
    infoTr,
    infoEn,
    insuranceBenefitsTr,
    insuranceBenefitsEn,
    whyChooseFleetTr,
    whyChooseFleetEn,
    servicesText,
    termsText,
    userRulesText,
    officialUrl,
    mainImage: normalizedMainImage,
    galleryImages: galleryWithMain,
    carouselActive: source.carouselActive ?? galleryWithMain.length > 1,
    carouselSpeed: asCarouselSpeed(source.carouselSpeed),
    featured: Boolean(source.featured),
    active: source.active !== false,
    rentalPackages,
    variants: []
  };
}

function normalizeVehicleIdentity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function vehicleModelKey(vehicle: Pick<Vehicle, "brand" | "model">): string {
  return `${normalizeVehicleIdentity(vehicle.brand)}::${normalizeVehicleIdentity(vehicle.model)}`;
}

function rentalPackageFingerprint(pkg: RentalPackage): string {
  return [
    pkg.fuelType,
    pkg.transmission,
    String(pkg.prices[1000] ?? ""),
    String(pkg.prices[2000] ?? ""),
    String(pkg.prices[3000] ?? "")
  ].join("|");
}

function mergeRentalPackages(base: RentalPackage[], incoming: RentalPackage[]): RentalPackage[] {
  const merged: RentalPackage[] = [];
  const seenKeys = new Set<string>();
  const seenPrints = new Set<string>();

  const pushPackage = (candidate: RentalPackage) => {
    const normalized = normalizeRentalPackage(candidate, merged.length);
    const key = `${normalized.fuelType}|${normalized.transmission}`.toLowerCase();
    const fingerprint = rentalPackageFingerprint(normalized);
    if (seenKeys.has(key) || seenPrints.has(fingerprint)) return;
    seenKeys.add(key);
    seenPrints.add(fingerprint);
    merged.push(normalized);
  };

  base.forEach(pushPackage);
  incoming.forEach(pushPackage);

  return merged;
}

function dedupeVehiclesByModel(vehicles: Vehicle[]): Vehicle[] {
  const mergedByKey = new Map<string, Vehicle>();
  const orderedKeys: string[] = [];

  vehicles.forEach((vehicle) => {
    const normalized = normalizeVehicle(vehicle);
    const key = vehicleModelKey(normalized);
    const existing = mergedByKey.get(key);

    if (!existing) {
      const nextVehicle: Vehicle = {
        ...normalized,
        secondaryCategories: [...normalized.secondaryCategories],
        galleryImages: [...(normalized.galleryImages || [])],
        rentalPackages: [...(normalized.rentalPackages || [])],
        variants: []
      };
      mergedByKey.set(key, nextVehicle);
      orderedKeys.push(key);
      return;
    }

    const mergedCategories = Array.from(
      new Set([
        existing.primaryCategory,
        ...existing.secondaryCategories,
        normalized.primaryCategory,
        ...normalized.secondaryCategories
      ])
    );

    const nextMainImage = existing.mainImage || normalized.mainImage;
    const nextGallery = Array.from(
      new Set([
        nextMainImage,
        ...(existing.galleryImages || []),
        normalized.mainImage,
        ...(normalized.galleryImages || [])
      ].filter(Boolean))
    );

    const nextPackages = mergeRentalPackages(existing.rentalPackages || [], normalized.rentalPackages || []);

    const nextVehicle: Vehicle = {
      ...existing,
      infoTr: existing.infoTr || normalized.infoTr,
      infoEn: existing.infoEn || normalized.infoEn,
      servicesText: existing.servicesText || normalized.servicesText || "",
      termsText: existing.termsText || normalized.termsText || "",
      userRulesText: existing.userRulesText || normalized.userRulesText || "",
      officialUrl: existing.officialUrl || normalized.officialUrl,
      secondaryCategories: mergedCategories.filter((category) => category !== existing.primaryCategory),
      mainImage: nextMainImage,
      galleryImages: nextGallery.length ? nextGallery : [nextMainImage],
      carouselActive: (existing.carouselActive ?? nextGallery.length > 1) || Boolean(normalized.carouselActive),
      carouselSpeed: existing.carouselSpeed || normalized.carouselSpeed,
      featured: existing.featured || normalized.featured,
      active: existing.active || normalized.active,
      rentalPackages: nextPackages,
      variants: []
    };

    mergedByKey.set(key, nextVehicle);
  });

  return orderedKeys.map((key) => mergedByKey.get(key)).filter((item): item is Vehicle => Boolean(item));
}

function sanitizeProjectPayload(payload: Omit<Project, "id">): Omit<Project, "id"> {
  const next = { ...payload };
  next.status = asProjectStatus(next.status);
  next.date = next.date || new Date().toISOString().slice(0, 7);

  if (!next.imageUrl) next.imageUrl = CATEGORY_DEFAULT_MEDIA[next.category].image;
  if (!next.featuredImage) next.featuredImage = next.imageUrl;
  if (!next.videoUrl) next.videoUrl = CATEGORY_DEFAULT_MEDIA[next.category].video;
  if (!Array.isArray(next.galleryImages)) next.galleryImages = [];

  const galleryCandidates = [next.featuredImage, next.imageUrl, ...next.galleryImages].filter(
    (item): item is string => Boolean(item?.trim())
  );
  next.galleryImages = Array.from(new Set(galleryCandidates));
  next.carouselSpeed = asCarouselSpeed(next.carouselSpeed);
  next.carouselActive = next.carouselActive ?? next.galleryImages.length > 1;

  if (next.category !== "fleet") {
    if (isFleetImage(next.imageUrl)) next.imageUrl = CATEGORY_DEFAULT_MEDIA[next.category].image;
    if (next.featuredImage && isFleetImage(next.featuredImage)) {
      next.featuredImage = CATEGORY_DEFAULT_MEDIA[next.category].image;
    }
    next.galleryImages = next.galleryImages.map((path) =>
      isFleetImage(path) ? CATEGORY_DEFAULT_MEDIA[next.category].image : path
    );
    if (isFleetImage(next.videoUrl)) next.videoUrl = CATEGORY_DEFAULT_MEDIA[next.category].video;
  }

  const normalized = {
    ...next,
    imageUrl: getSafeProjectImage(next as Project),
    featuredImage: getSafeProjectImage(next as Project),
    videoUrl: getSafeProjectVideo(next as Project)
  };

  const uniqueGallery = Array.from(
    new Set(
      (normalized.galleryImages || [])
        .map((path) => (isFleetImage(path) && normalized.category !== "fleet" ? normalized.imageUrl : path))
        .filter(Boolean)
    )
  );

  return {
    ...normalized,
    galleryImages: uniqueGallery.length ? uniqueGallery : [normalized.imageUrl]
  };
}

function normalizeProject(source: LegacyProject, index: number): Project {
  const fallback = defaultSiteContent.projects[index % defaultSiteContent.projects.length];
  const category = source.category || fallback.category;

  const merged: Omit<Project, "id"> = sanitizeProjectPayload({
    titleTr: source.titleTr || fallback.titleTr,
    titleEn: source.titleEn || fallback.titleEn,
    summaryTr: source.summaryTr || fallback.summaryTr,
    summaryEn: source.summaryEn || fallback.summaryEn,
    descriptionTr: source.descriptionTr || source.summaryTr || fallback.descriptionTr,
    descriptionEn: source.descriptionEn || source.summaryEn || fallback.descriptionEn,
    locationTr: source.locationTr || fallback.locationTr,
    locationEn: source.locationEn || fallback.locationEn,
    date: source.date || fallback.date,
    status: source.status || fallback.status,
    category,
    featuredImage: source.featuredImage || source.imageUrl || fallback.imageUrl,
    galleryImages: Array.isArray(source.galleryImages)
      ? source.galleryImages
      : [source.featuredImage || source.imageUrl || fallback.imageUrl],
    carouselActive: source.carouselActive,
    carouselSpeed: source.carouselSpeed,
    imageUrl: source.imageUrl || fallback.imageUrl,
    videoUrl: source.videoUrl || fallback.videoUrl,
    featured: Boolean(source.featured)
  });

  return {
    id: source.id || generateId("p"),
    ...merged
  };
}

function normalizeSiteContent(source: SiteContent): SiteContent {
  const merged: SiteContent = {
    ...defaultSiteContent,
    ...source,
    home: {
      ...defaultSiteContent.home,
      ...(source.home ?? {})
    },
    about: {
      ...defaultSiteContent.about,
      ...(source.about ?? {})
    },
    construction: {
      ...defaultSiteContent.construction,
      ...(source.construction ?? {})
    },
    architecture: {
      ...defaultSiteContent.architecture,
      ...(source.architecture ?? {})
    },
    fleetInformation: {
      ...defaultFleetInformation,
      ...(source.fleetInformation ?? {}),
      includedServices: Array.isArray(source.fleetInformation?.includedServices)
        ? source.fleetInformation.includedServices
        : defaultFleetInformation.includedServices
    },
    projectCardTexts: {
      construction: {
        ...(defaultSiteContent.projectCardTexts?.construction ?? {}),
        ...((source as Partial<SiteContent>).projectCardTexts?.construction ?? {})
      },
      architecture: {
        ...(defaultSiteContent.projectCardTexts?.architecture ?? {}),
        ...((source as Partial<SiteContent>).projectCardTexts?.architecture ?? {})
      }
    },
    contact: {
      ...defaultSiteContent.contact,
      ...(source.contact ?? {}),
      social: {
        ...defaultSiteContent.contact.social,
        ...(source.contact?.social ?? {})
      }
    },
    settings: {
      ...defaultSiteContent.settings,
      ...(source.settings ?? {})
    },
    mediaLibrary: Array.isArray(source.mediaLibrary)
      ? source.mediaLibrary.filter(Boolean)
      : defaultSiteContent.mediaLibrary
  };

  const vehiclesSource: LegacyVehicle[] =
    Array.isArray(source.vehicles) && source.vehicles.length
      ? (source.vehicles as LegacyVehicle[])
      : defaultSiteContent.vehicles;

  const normalizedSourceVehicles = vehiclesSource.map((vehicle) => normalizeVehicle(vehicle));
  const normalizedDefaultVehicles = defaultSiteContent.vehicles.map((vehicle) => normalizeVehicle(vehicle));
  const existingVehicleIds = new Set(normalizedSourceVehicles.map((vehicle) => vehicle.id));
  const existingVehicleSlugs = new Set(normalizedSourceVehicles.map((vehicle) => vehicle.slug));

  const missingDefaultVehicles = normalizedDefaultVehicles.filter(
    (vehicle) => !existingVehicleIds.has(vehicle.id) && !existingVehicleSlugs.has(vehicle.slug)
  );

  merged.vehicles = dedupeVehiclesByModel([...normalizedSourceVehicles, ...missingDefaultVehicles]);

  const projectsSource: LegacyProject[] =
    Array.isArray(source.projects) && source.projects.length
      ? (source.projects as LegacyProject[])
      : defaultSiteContent.projects;

  merged.projects = projectsSource.map((project, index) => normalizeProject(project, index));

  const legacyWhatsapp = "905550000000";
  const sanitizeLegacyWhatsapp = (value: string | undefined): string => {
    const trimmed = value?.trim() || "";
    return trimmed === legacyWhatsapp ? "" : trimmed;
  };

  const fallbackGeneralWhatsapp =
    merged.contact.whatsappGeneral?.trim() ||
    merged.contact.whatsapp?.trim() ||
    defaultSiteContent.contact.whatsappGeneral;
  const isLegacyWhatsappValue = fallbackGeneralWhatsapp === legacyWhatsapp;
  const normalizedGeneralWhatsapp = isLegacyWhatsappValue
    ? defaultSiteContent.contact.whatsappGeneral
    : fallbackGeneralWhatsapp;

  merged.contact.whatsappGeneral = normalizedGeneralWhatsapp;
  merged.contact.whatsapp = normalizedGeneralWhatsapp;
  merged.contact.whatsappFleet = sanitizeLegacyWhatsapp(merged.contact.whatsappFleet) ||
    defaultSiteContent.contact.whatsappFleet ||
    normalizedGeneralWhatsapp;
  merged.contact.whatsappConstruction = sanitizeLegacyWhatsapp(merged.contact.whatsappConstruction) ||
    defaultSiteContent.contact.whatsappConstruction ||
    normalizedGeneralWhatsapp;
  merged.contact.whatsappArchitecture = sanitizeLegacyWhatsapp(merged.contact.whatsappArchitecture) || "";
  const rawMapEmbed = merged.contact.mapEmbedUrl?.trim() || "";
  const rawMapLink = merged.contact.mapLinkUrl?.trim() || "";
  const isLegacyGenericMap =
    rawMapEmbed === "https://maps.google.com" || rawMapLink === "https://maps.google.com";

  merged.contact.mapEmbedUrl =
    isLegacyGenericMap || !isEmbeddableGoogleMap(rawMapEmbed)
      ? DEFAULT_CONTACT_MAP_EMBED_URL
      : rawMapEmbed;
  merged.contact.mapLinkUrl =
    isLegacyGenericMap || !rawMapLink ? DEFAULT_CONTACT_MAP_LINK_URL : rawMapLink;

  return merged;
}

function normalizeRequestStatus(status: string | undefined): QuoteRequestStatus {
  if (status === "pending" || status === "contacted" || status === "closed") {
    return status;
  }
  if (status === "approved" || status === "rejected") return "closed";
  return "pending";
}

function normalizeRequests(source: QuoteRequest[]): QuoteRequest[] {
  return source.map((request) => ({
    ...request,
    status: normalizeRequestStatus(request.status),
    createdAt: request.createdAt || new Date().toISOString()
  }));
}

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [quoteModalState, setQuoteModalState] = useState<{ isOpen: boolean; defaults: QuoteModalDefaults }>({
    isOpen: false,
    defaults: {}
  });

  useEffect(() => {
    clearLegacyUserStorage();
    const savedContent = normalizeSiteContent(readSiteContent());
    const savedLocale = readLocale();
    const savedRequests = normalizeRequests(readQuoteRequests());
    const seededRequests =
      savedRequests.length || process.env.NODE_ENV === "production" ? savedRequests : MOCK_QUOTE_REQUESTS;

    setContent(savedContent);
    setLocaleState(savedLocale);
    setQuoteRequests(seededRequests);
    setIsHydrated(true);

    void fetch("/api/admin/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store"
    })
      .then(async (response) => {
        if (!response.ok) {
          setAdminSession(null);
          return;
        }
        const data = (await response.json()) as { authenticated?: boolean; username?: string };
        if (data.authenticated && data.username) {
          setAdminSession({
            role: "admin",
            username: data.username,
            loginAt: new Date().toISOString()
          });
        } else {
          setAdminSession(null);
        }
      })
      .catch(() => {
        setAdminSession(null);
      });
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const syncFromStorage = () => {
      const storedContent = normalizeSiteContent(readSiteContent());
      const storedLocale = readLocale();
      const storedRequests = normalizeRequests(readQuoteRequests());

      setContent(storedContent);
      setLocaleState(storedLocale);
      setQuoteRequests(storedRequests);
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (
        event.key === STORAGE_KEYS.siteContent ||
        event.key === STORAGE_KEYS.locale ||
        event.key === STORAGE_KEYS.quoteRequests
      ) {
        syncFromStorage();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        syncFromStorage();
        void fetch("/api/admin/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        })
          .then(async (response) => {
            if (!response.ok) {
              setAdminSession(null);
              return;
            }
            const data = (await response.json()) as { authenticated?: boolean; username?: string };
            if (data.authenticated && data.username) {
              setAdminSession({
                role: "admin",
                username: data.username,
                loginAt: new Date().toISOString()
              });
            } else {
              setAdminSession(null);
            }
          })
          .catch(() => setAdminSession(null));
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onVisibility);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onVisibility);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    let cancelled = false;

    const syncVehiclesFromService = async () => {
      try {
        const remoteVehicles = await getVehicleRecords();
        if (cancelled) return;
        if (!Array.isArray(remoteVehicles) || !remoteVehicles.length) return;
        const normalizedVehicles = dedupeVehiclesByModel(
          remoteVehicles.map((vehicle) => normalizeVehicle(vehicle))
        );
        setContent((prev) => ({ ...prev, vehicles: normalizedVehicles }));
      } catch {
        // Fallback already handled in service
      }
    };

    const syncFleetInformationFromService = async () => {
      try {
        const remoteFleetInformation = await getFleetInformationRecord();
        if (cancelled) return;
        setContent((prev) => ({ ...prev, fleetInformation: remoteFleetInformation }));
      } catch {
        // Fallback already handled in service
      }
    };

    const syncSettingsFromService = async () => {
      try {
        const remoteSettings = await getSettingsRecord();
        if (cancelled) return;
        setContent((prev) => ({ ...prev, settings: remoteSettings }));
      } catch {
        // Fallback already handled in service
      }
    };

    void syncVehiclesFromService();
    void syncFleetInformationFromService();
    void syncSettingsFromService();
    return () => {
      cancelled = true;
    };
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    writeSiteContent(content);
  }, [content, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    writeLocale(locale);
  }, [isHydrated, locale]);

  useEffect(() => {
    if (!isHydrated) return;
    writeQuoteRequests(quoteRequests);
  }, [isHydrated, quoteRequests]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
  };

  const addVehicle = (vehicle: Omit<Vehicle, "id">) => {
    const tempVehicle = normalizeVehicle({
      ...vehicle,
      id: generateId("v")
    });

    setContent((prev) => ({
      ...prev,
      vehicles: dedupeVehiclesByModel([tempVehicle, ...prev.vehicles])
    }));

    void createVehicleRecord(tempVehicle)
      .then((savedVehicle) => {
        const normalizedSaved = normalizeVehicle(savedVehicle);
        setContent((prev) => ({
          ...prev,
          vehicles: dedupeVehiclesByModel(
            prev.vehicles.map((item) => (item.id === tempVehicle.id ? normalizedSaved : item))
          )
        }));
      })
      .catch(() => {
        // fallback storage already handled in service
      });
  };

  const updateVehicle = (id: string, updated: Partial<Vehicle>) => {
    let optimisticVehicle: Vehicle | null = null;

    setContent((prev) => {
      const updatedVehicles = prev.vehicles.map((vehicle) => {
        if (vehicle.id !== id) return vehicle;
        optimisticVehicle = normalizeVehicle({ ...vehicle, ...updated, id });
        return optimisticVehicle;
      });
      return {
        ...prev,
        vehicles: dedupeVehiclesByModel(updatedVehicles)
      };
    });

    if (!optimisticVehicle) return;
    void updateVehicleRecord(id, optimisticVehicle)
      .then((savedVehicle) => {
        if (!savedVehicle) return;
        const normalizedSaved = normalizeVehicle(savedVehicle);
        setContent((prev) => ({
          ...prev,
          vehicles: dedupeVehiclesByModel(
            prev.vehicles.map((item) => (item.id === id ? normalizedSaved : item))
          )
        }));
      })
      .catch(() => {
        // fallback storage already handled in service
      });
  };

  const deleteVehicle = (id: string) => {
    setContent((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((vehicle) => vehicle.id !== id)
    }));
    void deleteVehicleRecord(id).catch(() => {
      // fallback storage already handled in service
    });
  };

  const addProject = (project: Omit<Project, "id">) => {
    const sanitized = sanitizeProjectPayload(project);
    setContent((prev) => ({
      ...prev,
      projects: [{ ...sanitized, id: generateId("p") }, ...prev.projects]
    }));
  };

  const updateProject = (id: string, updated: Partial<Project>) => {
    setContent((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => {
        if (project.id !== id) return project;
        const merged = sanitizeProjectPayload({ ...project, ...updated });
        return { ...project, ...merged };
      })
    }));
  };

  const deleteProject = (id: string) => {
    setContent((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id)
    }));
  };

  const updateContact = (contact: ContactInfo) => {
    const normalizedWhatsappGeneral =
      sanitizePhoneLike(contact.whatsappGeneral || contact.whatsapp) ||
      defaultSiteContent.contact.whatsappGeneral;
    const normalizedWhatsappFleet =
      sanitizePhoneLike(contact.whatsappFleet) || defaultSiteContent.contact.whatsappFleet;
    const normalizedWhatsappConstruction =
      sanitizePhoneLike(contact.whatsappConstruction) || defaultSiteContent.contact.whatsappConstruction;
    const normalizedWhatsappArchitecture = sanitizePhoneLike(contact.whatsappArchitecture);
    const normalizedEmbed = sanitizePlainText(contact.mapEmbedUrl, 2000);
    const normalizedMapLink = sanitizePlainText(contact.mapLinkUrl, 1000);

    setContent((prev) => ({
      ...prev,
      contact: {
        ...contact,
        phone: sanitizePlainText(contact.phone, 40),
        email: sanitizePlainText(contact.email, 120),
        addressTr: sanitizeMultilineText(contact.addressTr, 1000),
        addressEn: sanitizeMultilineText(contact.addressEn, 1000),
        whatsappGeneral: normalizedWhatsappGeneral,
        whatsapp: normalizedWhatsappGeneral,
        whatsappFleet: normalizedWhatsappFleet,
        whatsappConstruction: normalizedWhatsappConstruction,
        whatsappArchitecture: normalizedWhatsappArchitecture,
        mapEmbedUrl: isEmbeddableGoogleMap(normalizedEmbed)
          ? normalizedEmbed
          : DEFAULT_CONTACT_MAP_EMBED_URL,
        mapLinkUrl: normalizedMapLink || DEFAULT_CONTACT_MAP_LINK_URL,
        social: {
          instagram: sanitizePlainText(contact.social?.instagram, 120)
        }
      }
    }));
  };

  const updateHome = (home: HomeContent) => {
    setContent((prev) => ({
      ...prev,
      home: {
        headlineTr: sanitizePlainText(home.headlineTr, 220),
        headlineEn: sanitizePlainText(home.headlineEn, 220),
        subHeadlineTr: sanitizeMultilineText(home.subHeadlineTr, 1000),
        subHeadlineEn: sanitizeMultilineText(home.subHeadlineEn, 1000),
        ctaTr: sanitizePlainText(home.ctaTr, 80),
        ctaEn: sanitizePlainText(home.ctaEn, 80),
        serviceTitleTr: sanitizePlainText(home.serviceTitleTr, 180),
        serviceTitleEn: sanitizePlainText(home.serviceTitleEn, 180),
        serviceDescriptionTr: sanitizeMultilineText(home.serviceDescriptionTr, 1200),
        serviceDescriptionEn: sanitizeMultilineText(home.serviceDescriptionEn, 1200)
      }
    }));
  };

  const updateAbout = (about: AboutContent) => {
    setContent((prev) => ({
      ...prev,
      about: {
        titleTr: sanitizePlainText(about.titleTr, 220),
        titleEn: sanitizePlainText(about.titleEn, 220),
        descriptionTr: sanitizeMultilineText(about.descriptionTr, 20000),
        descriptionEn: sanitizeMultilineText(about.descriptionEn, 20000),
        videoUrl: sanitizePlainText(about.videoUrl, 500),
        valuesTitleTr: sanitizePlainText(about.valuesTitleTr, 120),
        valuesTitleEn: sanitizePlainText(about.valuesTitleEn, 120)
      }
    }));
  };

  const updateConstruction = (construction: ConstructionContent) => {
    setContent((prev) => ({
      ...prev,
      construction: {
        titleTr: sanitizePlainText(construction.titleTr, 220),
        titleEn: sanitizePlainText(construction.titleEn, 220),
        descriptionTr: sanitizeMultilineText(construction.descriptionTr, 2000),
        descriptionEn: sanitizeMultilineText(construction.descriptionEn, 2000),
        residentialTr: sanitizeMultilineText(construction.residentialTr, 1200),
        residentialEn: sanitizeMultilineText(construction.residentialEn, 1200),
        commercialTr: sanitizeMultilineText(construction.commercialTr, 1200),
        commercialEn: sanitizeMultilineText(construction.commercialEn, 1200),
        renovationTr: sanitizeMultilineText(construction.renovationTr, 1200),
        renovationEn: sanitizeMultilineText(construction.renovationEn, 1200),
        turnkeyTr: sanitizeMultilineText(construction.turnkeyTr, 1200),
        turnkeyEn: sanitizeMultilineText(construction.turnkeyEn, 1200)
      }
    }));
  };

  const updateArchitecture = (architecture: ArchitectureContent) => {
    setContent((prev) => ({
      ...prev,
      architecture: {
        titleTr: sanitizePlainText(architecture.titleTr, 220),
        titleEn: sanitizePlainText(architecture.titleEn, 220),
        descriptionTr: sanitizeMultilineText(architecture.descriptionTr, 2000),
        descriptionEn: sanitizeMultilineText(architecture.descriptionEn, 2000),
        interiorTr: sanitizeMultilineText(architecture.interiorTr, 1200),
        interiorEn: sanitizeMultilineText(architecture.interiorEn, 1200),
        exteriorTr: sanitizeMultilineText(architecture.exteriorTr, 1200),
        exteriorEn: sanitizeMultilineText(architecture.exteriorEn, 1200),
        drawingTr: sanitizeMultilineText(architecture.drawingTr, 1200),
        drawingEn: sanitizeMultilineText(architecture.drawingEn, 1200),
        conceptTr: sanitizeMultilineText(architecture.conceptTr, 1200),
        conceptEn: sanitizeMultilineText(architecture.conceptEn, 1200)
      }
    }));
  };

  const updateFleetInformation = (fleetInformation: FleetInformationContent) => {
    setContent((prev) => ({ ...prev, fleetInformation }));
    void updateFleetInformationRecord(fleetInformation)
      .then((savedFleetInformation) => {
        setContent((prev) => ({ ...prev, fleetInformation: savedFleetInformation }));
      })
      .catch(() => {
        // fallback storage already handled in service
      });
  };

  const updateProjectCardTexts = (
    section: keyof ProjectCardTextGroups,
    nextValues: Record<string, ProjectCardTextGroups[keyof ProjectCardTextGroups][string]>
  ) => {
    setContent((prev) => ({
      ...prev,
      projectCardTexts: {
        ...prev.projectCardTexts,
        [section]: nextValues
      }
    }));
  };

  const updateSettings = (settings: SettingsContent) => {
    setContent((prev) => ({ ...prev, settings }));
    void updateSettingsRecord(settings)
      .then((savedSettings) => {
        setContent((prev) => ({ ...prev, settings: savedSettings }));
      })
      .catch(() => {
        // fallback storage already handled in service
      });
  };

  const updateMediaLibrary = (items: string[]) => {
    const sanitized = items.map((item) => sanitizePlainText(item, 500)).filter(Boolean);
    setContent((prev) => ({ ...prev, mediaLibrary: sanitized }));
  };

  const loginAdmin = async (
    username: string,
    password: string
  ): Promise<{ ok: boolean; message?: string }> => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        username?: string;
      };

      if (!response.ok || !data.ok) {
        return {
          ok: false,
          message: data.message || "Kullanıcı adı veya şifre hatalı."
        };
      }

      setAdminSession({
        role: "admin",
        username: data.username || username.trim() || "admin",
        loginAt: new Date().toISOString()
      });

      return { ok: true };
    } catch {
      return { ok: false, message: "Giriş işlemi sırasında bir hata oluştu." };
    }
  };

  const logoutAdmin = () => {
    void fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include"
    });
    setAdminSession(null);
  };

  const createQuoteRequest = (payload: CreateQuotePayload) => {
    const name = sanitizePlainText(payload.name, 120);
    const phone = sanitizePhoneLike(payload.phone);
    const email = sanitizePlainText(payload.email, 160);
    const message = sanitizeMultilineText(payload.message, 4000);

    if (!name || !phone || !email) {
      return {
        ok: false,
        message:
          locale === "tr"
            ? "Lütfen ad, telefon ve e-posta alanlarını doldurun."
            : "Please fill in name, phone, and email fields."
      };
    }

    const next: QuoteRequest = {
      id: generateId("q"),
      name,
      phone,
      email,
      serviceType: payload.serviceType,
      selectedVehicleSlug: sanitizePlainText(payload.selectedVehicleSlug, 120),
      selectedVehicleLabel: sanitizePlainText(payload.selectedVehicleLabel, 200),
      selectedVariantId: sanitizePlainText(payload.selectedVariantId, 120),
      selectedVariantLabel: sanitizePlainText(payload.selectedVariantLabel, 200),
      selectedProjectId: sanitizePlainText(payload.selectedProjectId, 120),
      selectedProjectLabel: sanitizePlainText(payload.selectedProjectLabel, 200),
      message,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    setQuoteRequests((prev) => [next, ...prev]);

    return {
      ok: true,
      message:
        locale === "tr"
          ? "Talebiniz alındı. Ekibimiz en kısa sürede sizinle iletişime geçecek."
          : "Your request has been received. Our team will contact you soon."
    };
  };

  const updateQuoteRequestStatus = (id: string, status: QuoteRequestStatus) => {
    setQuoteRequests((prev) => prev.map((request) => (request.id === id ? { ...request, status } : request)));
  };

  const deleteQuoteRequest = (id: string) => {
    setQuoteRequests((prev) => prev.filter((request) => request.id !== id));
  };

  const openQuoteModal = (defaults: QuoteModalDefaults = {}) => {
    setQuoteModalState({
      isOpen: true,
      defaults
    });
  };

  const closeQuoteModal = () => {
    setQuoteModalState((prev) => ({
      ...prev,
      isOpen: false
    }));
  };

  const value: SiteDataContextType = {
    locale,
    setLocale,
    content,
    isHydrated,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addProject,
    updateProject,
    deleteProject,
    updateContact,
    updateHome,
    updateAbout,
    updateConstruction,
    updateArchitecture,
    updateFleetInformation,
    updateProjectCardTexts,
    updateSettings,
    updateMediaLibrary,
    adminSession,
    isAdminAuthenticated: adminSession?.role === "admin",
    loginAdmin,
    logoutAdmin,
    quoteRequests,
    createQuoteRequest,
    updateQuoteRequestStatus,
    deleteQuoteRequest,
    openQuoteModal,
    closeQuoteModal,
    quoteModalState
  };

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): SiteDataContextType {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error("useSiteData must be used inside SiteDataProvider");
  }
  return context;
}

