"use client";

import { defaultSiteContent } from "@/lib/data/default-site-content";
import { CATEGORY_DEFAULT_MEDIA, ensureFleetImage, getSafeProjectImage, getSafeProjectVideo, isFleetImage } from "@/lib/data/image-map";
import {
  clearLegacyUserStorage,
  readAdminSession,
  readLocale,
  readQuoteRequests,
  readSiteContent,
  writeAdminSession,
  writeLocale,
  writeQuoteRequests,
  writeSiteContent
} from "@/lib/storage/client";
import {
  AboutContent,
  AdminSession,
  ArchitectureContent,
  CarouselSpeed,
  ConstructionContent,
  ContactInfo,
  FuelType,
  HomeContent,
  Locale,
  Project,
  ProjectStatus,
  QuoteRequest,
  QuoteRequestStatus,
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
  updateSettings: (settings: SettingsContent) => void;
  updateMediaLibrary: (items: string[]) => void;
  adminSession: AdminSession | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (username: string, password: string) => boolean;
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

const FUEL_TYPES: FuelType[] = ["Benzin", "Dizel", "Hibrit", "Elektrik"];
const TRANSMISSION_TYPES: TransmissionType[] = ["Otomatik", "Manuel"];
const AVAILABILITY_TYPES: VariantAvailabilityStatus[] = ["available", "limited", "unavailable"];
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

type LegacyVehicle = Partial<Vehicle> & {
  brandModel?: string;
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
  if (value && FUEL_TYPES.includes(value as FuelType)) return value as FuelType;
  return fallback;
}

function asTransmission(value: string | undefined, fallback: TransmissionType): TransmissionType {
  if (value && TRANSMISSION_TYPES.includes(value as TransmissionType)) return value as TransmissionType;
  return fallback;
}

function asAvailability(value: string | undefined): VariantAvailabilityStatus {
  if (value && AVAILABILITY_TYPES.includes(value as VariantAvailabilityStatus)) {
    return value as VariantAvailabilityStatus;
  }
  return "available";
}

function asProjectStatus(value: string | undefined): ProjectStatus {
  if (value && PROJECT_STATUS.includes(value as ProjectStatus)) return value as ProjectStatus;
  return "planned";
}

function asCarouselSpeed(value: string | undefined): CarouselSpeed {
  if (value && CAROUSEL_SPEEDS.includes(value as CarouselSpeed)) return value as CarouselSpeed;
  return "normal";
}

function normalizeVariant(source: Partial<VehicleVariant>, index: number): VehicleVariant {
  return {
    variantId: source.variantId?.trim() || generateId(`vr${index + 1}`),
    title: source.title?.trim() || `Varyant ${index + 1}`,
    fuelType: asFuelType(source.fuelType, "Benzin"),
    transmission: asTransmission(source.transmission, "Otomatik"),
    modelYear: Number(source.modelYear) || new Date().getFullYear(),
    monthlyKm: Number(source.monthlyKm) || 3000,
    monthlyPrice: Number(source.monthlyPrice) || 0,
    deposit: Number(source.deposit) || 0,
    availabilityStatus: asAvailability(source.availabilityStatus),
    notes: source.notes?.trim() || ""
  };
}

function normalizeVehicle(source: LegacyVehicle, index: number): Vehicle {
  const legacyType = source.type;
  const brandModel = source.brandModel?.trim() || "Araç";
  const [legacyBrand, ...legacyModelParts] = brandModel.split(" ");
  const legacyModel = legacyModelParts.join(" ").trim() || brandModel;

  const brand = source.brand?.trim() || legacyBrand || "Marka";
  const model = source.model?.trim() || legacyModel || "Model";
  const slug = source.slug?.trim() || toSlug(`${brand}-${model}`);

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

  const variants = variantsSource.length
    ? variantsSource.map((item, variantIndex) => normalizeVariant(item, variantIndex))
    : defaultSiteContent.vehicles[index % defaultSiteContent.vehicles.length].variants.map((item, variantIndex) =>
        normalizeVariant(item, variantIndex)
      );

  const normalizedMainImage = ensureFleetImage(source.mainImage || source.imageUrl || "");
  const normalizedGalleryImages = (Array.isArray(source.galleryImages) ? source.galleryImages : [])
    .map((path: string) => ensureFleetImage(path))
    .filter(Boolean);
  const galleryWithMain = Array.from(new Set([normalizedMainImage, ...normalizedGalleryImages]));

  return {
    id: source.id?.trim() || generateId("v"),
    brand,
    model,
    slug,
    primaryCategory,
    secondaryCategories,
    mainImage: normalizedMainImage,
    galleryImages: galleryWithMain,
    carouselActive: source.carouselActive ?? galleryWithMain.length > 1,
    carouselSpeed: asCarouselSpeed(source.carouselSpeed),
    featured: Boolean(source.featured),
    active: source.active !== false,
    variants
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

function variantFingerprint(variant: VehicleVariant): string {
  return [
    normalizeVehicleIdentity(variant.title || ""),
    variant.fuelType,
    variant.transmission,
    String(variant.modelYear),
    String(variant.monthlyKm),
    String(variant.monthlyPrice),
    String(variant.deposit),
    variant.availabilityStatus
  ].join("|");
}

function mergeVehicleVariants(base: VehicleVariant[], incoming: VehicleVariant[]): VehicleVariant[] {
  const merged: VehicleVariant[] = [];
  const seenVariantIds = new Set<string>();
  const seenVariantPrints = new Set<string>();

  const pushVariant = (candidate: VehicleVariant) => {
    const normalized = normalizeVariant(candidate, merged.length);
    const variantIdKey = normalizeVehicleIdentity(normalized.variantId);
    const fingerprint = variantFingerprint(normalized);
    if (seenVariantIds.has(variantIdKey) || seenVariantPrints.has(fingerprint)) return;
    seenVariantIds.add(variantIdKey);
    seenVariantPrints.add(fingerprint);
    merged.push(normalized);
  };

  base.forEach(pushVariant);
  incoming.forEach(pushVariant);

  return merged;
}

function dedupeVehiclesByModel(vehicles: Vehicle[]): Vehicle[] {
  const mergedByKey = new Map<string, Vehicle>();
  const orderedKeys: string[] = [];

  vehicles.forEach((vehicle, index) => {
    const normalized = normalizeVehicle(vehicle, index);
    const key = vehicleModelKey(normalized);
    const existing = mergedByKey.get(key);

    if (!existing) {
      const nextVehicle: Vehicle = {
        ...normalized,
        secondaryCategories: [...normalized.secondaryCategories],
        galleryImages: [...(normalized.galleryImages || [])],
        variants: [...normalized.variants]
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

    const nextVariants = mergeVehicleVariants(existing.variants, normalized.variants);

    const nextVehicle: Vehicle = {
      ...existing,
      secondaryCategories: mergedCategories.filter((category) => category !== existing.primaryCategory),
      mainImage: nextMainImage,
      galleryImages: nextGallery.length ? nextGallery : [nextMainImage],
      carouselActive: (existing.carouselActive ?? nextGallery.length > 1) || Boolean(normalized.carouselActive),
      carouselSpeed: existing.carouselSpeed || normalized.carouselSpeed,
      featured: existing.featured || normalized.featured,
      active: existing.active || normalized.active,
      variants: nextVariants.length ? nextVariants : existing.variants
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

  const normalizedSourceVehicles = vehiclesSource.map((vehicle, index) => normalizeVehicle(vehicle, index));
  const normalizedDefaultVehicles = defaultSiteContent.vehicles.map((vehicle, index) =>
    normalizeVehicle(vehicle, index)
  );
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
    const savedAdminSession = readAdminSession();
    const savedRequests = normalizeRequests(readQuoteRequests());
    const seededRequests =
      savedRequests.length || process.env.NODE_ENV === "production" ? savedRequests : MOCK_QUOTE_REQUESTS;

    setContent(savedContent);
    setLocaleState(savedLocale);
    setAdminSession(savedAdminSession);
    setQuoteRequests(seededRequests);
    setIsHydrated(true);
  }, []);

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
    writeAdminSession(adminSession);
  }, [adminSession, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    writeQuoteRequests(quoteRequests);
  }, [isHydrated, quoteRequests]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
  };

  const addVehicle = (vehicle: Omit<Vehicle, "id">) => {
    setContent((prev) => {
      const nextVehicle = normalizeVehicle(
        {
          ...vehicle,
          id: generateId("v")
        },
        0
      );
      return {
        ...prev,
        vehicles: dedupeVehiclesByModel([nextVehicle, ...prev.vehicles])
      };
    });
  };

  const updateVehicle = (id: string, updated: Partial<Vehicle>) => {
    setContent((prev) => {
      const updatedVehicles = prev.vehicles.map((vehicle, index) => {
        if (vehicle.id !== id) return vehicle;
        return normalizeVehicle({ ...vehicle, ...updated, id }, index);
      });
      return {
        ...prev,
        vehicles: dedupeVehiclesByModel(updatedVehicles)
      };
    });
  };

  const deleteVehicle = (id: string) => {
    setContent((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((vehicle) => vehicle.id !== id)
    }));
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
    setContent((prev) => ({ ...prev, contact }));
  };

  const updateHome = (home: HomeContent) => {
    setContent((prev) => ({ ...prev, home }));
  };

  const updateAbout = (about: AboutContent) => {
    setContent((prev) => ({ ...prev, about }));
  };

  const updateConstruction = (construction: ConstructionContent) => {
    setContent((prev) => ({ ...prev, construction }));
  };

  const updateArchitecture = (architecture: ArchitectureContent) => {
    setContent((prev) => ({ ...prev, architecture }));
  };

  const updateSettings = (settings: SettingsContent) => {
    setContent((prev) => ({ ...prev, settings }));
  };

  const updateMediaLibrary = (items: string[]) => {
    const sanitized = items.map((item) => item.trim()).filter(Boolean);
    setContent((prev) => ({ ...prev, mediaLibrary: sanitized }));
  };

  const loginAdmin = (username: string, password: string): boolean => {
    const isSuccess = username === "admin" && password === "admin123";
    if (!isSuccess) return false;
    setAdminSession({
      role: "admin",
      username: "admin",
      loginAt: new Date().toISOString()
    });
    return true;
  };

  const logoutAdmin = () => {
    setAdminSession(null);
  };

  const createQuoteRequest = (payload: CreateQuotePayload) => {
    if (!payload.name.trim() || !payload.phone.trim() || !payload.email.trim()) {
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
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      serviceType: payload.serviceType,
      selectedVehicleSlug: payload.selectedVehicleSlug,
      selectedVehicleLabel: payload.selectedVehicleLabel,
      selectedVariantId: payload.selectedVariantId,
      selectedVariantLabel: payload.selectedVariantLabel,
      selectedProjectId: payload.selectedProjectId,
      selectedProjectLabel: payload.selectedProjectLabel,
      message: payload.message.trim(),
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
