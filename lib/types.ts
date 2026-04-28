export type Locale = "tr" | "en";

export type ServiceType = "construction" | "architecture" | "fleet";
export type ProjectCategory = ServiceType;

export type VehicleCategory =
  | "suv"
  | "electric"
  | "economy"
  | "luxury"
  | "commercial"
  | "sedan"
  | "hatchback"
  | "van";

export type FuelType = "Benzin" | "Dizel" | "Hibrit" | "Elektrik";
export type TransmissionType = "Otomatik" | "Manuel";

export type VariantAvailabilityStatus = "available" | "limited" | "unavailable";
export type ProjectStatus = "completed" | "ongoing" | "planned";
export type QuoteRequestStatus = "pending" | "contacted" | "closed";
export type CarouselSpeed = "slow" | "normal" | "fast";

export interface VehicleVariant {
  variantId: string;
  title: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  modelYear: number;
  monthlyKm: number;
  monthlyPrice: number;
  deposit: number;
  availabilityStatus: VariantAvailabilityStatus;
  notes?: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  slug: string;
  primaryCategory: VehicleCategory;
  secondaryCategories: VehicleCategory[];
  mainImage: string;
  galleryImages: string[];
  carouselActive?: boolean;
  carouselSpeed?: CarouselSpeed;
  featured: boolean;
  active: boolean;
  variants: VehicleVariant[];
}

export interface Project {
  id: string;
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  descriptionTr: string;
  descriptionEn: string;
  locationTr: string;
  locationEn: string;
  date: string;
  status: ProjectStatus;
  category: ProjectCategory;
  featuredImage?: string;
  galleryImages?: string[];
  carouselActive?: boolean;
  carouselSpeed?: CarouselSpeed;
  imageUrl: string;
  videoUrl: string;
  featured: boolean;
}

export interface SocialLinks {
  instagram: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  addressTr: string;
  addressEn: string;
  whatsapp: string;
  mapEmbedUrl: string;
  social: SocialLinks;
}

export interface HomeContent {
  headlineTr: string;
  headlineEn: string;
  subHeadlineTr: string;
  subHeadlineEn: string;
  ctaTr: string;
  ctaEn: string;
  serviceTitleTr: string;
  serviceTitleEn: string;
  serviceDescriptionTr: string;
  serviceDescriptionEn: string;
}

export interface AboutContent {
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  valuesTitleTr: string;
  valuesTitleEn: string;
}

export interface ConstructionContent {
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  residentialTr: string;
  residentialEn: string;
  commercialTr: string;
  commercialEn: string;
  renovationTr: string;
  renovationEn: string;
  turnkeyTr: string;
  turnkeyEn: string;
}

export interface ArchitectureContent {
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  interiorTr: string;
  interiorEn: string;
  exteriorTr: string;
  exteriorEn: string;
  drawingTr: string;
  drawingEn: string;
  conceptTr: string;
  conceptEn: string;
}

export interface SettingsContent {
  maintenanceMode: boolean;
  contactEmail: string;
  currency: "TRY";
}

export interface SiteContent {
  vehicles: Vehicle[];
  projects: Project[];
  contact: ContactInfo;
  home: HomeContent;
  about: AboutContent;
  construction: ConstructionContent;
  architecture: ArchitectureContent;
  mediaLibrary: string[];
  settings: SettingsContent;
}

export interface ConstructionProjectMedia {
  projectId: string;
  photos: string[];
  videos: string[];
  posters: string[];
}

export interface AdminSession {
  role: "admin";
  username: string;
  loginAt: string;
}

export interface QuoteRequest {
  id: string;
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
  status: QuoteRequestStatus;
  createdAt: string;
}

export interface TranslationMap {
  [key: string]: {
    tr: string;
    en: string;
  };
}
