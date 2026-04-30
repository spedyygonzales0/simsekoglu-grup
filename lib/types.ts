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

export type FuelType = "Benzin" | "Dizel" | "Hibrit" | "Elektrik" | "Elektrikli";
export type TransmissionType = "Otomatik" | "Manuel";
export type RentalKm = 1000 | 2000 | 3000;

export type VariantAvailabilityStatus = "available" | "limited" | "unavailable";
export type ProjectStatus = "completed" | "ongoing" | "planned";
export type QuoteRequestStatus = "pending" | "contacted" | "closed";
export type CarouselSpeed = "slow" | "normal" | "fast";

export interface VehicleVariant {
  variantId: string;
  title: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  modelYear?: number;
  monthlyKm: number;
  monthlyPrice: number;
  deposit?: number;
  availabilityStatus?: VariantAvailabilityStatus;
  notes?: string;
}

export interface RentalPackage {
  id: string;
  fuelType: Exclude<FuelType, "Elektrik">;
  transmission: TransmissionType;
  prices: {
    1000: number | null;
    2000: number | null;
    3000: number | null;
  };
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  modelYearLabel: string;
  slug: string;
  primaryCategory: VehicleCategory;
  secondaryCategories: VehicleCategory[];
  infoTr: string;
  infoEn: string;
  insuranceBenefitsTr?: string;
  insuranceBenefitsEn?: string;
  whyChooseFleetTr?: string;
  whyChooseFleetEn?: string;
  servicesText?: string;
  termsText?: string;
  userRulesText?: string;
  officialUrl: string;
  mainImage: string;
  galleryImages: string[];
  carouselActive?: boolean;
  carouselSpeed?: CarouselSpeed;
  featured: boolean;
  active: boolean;
  rentalPackages: RentalPackage[];
  // Legacy field kept for backward compatibility with old local data.
  variants?: VehicleVariant[];
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

export interface ArchitectureCategory {
  id: string;
  titleTr: string;
  titleEn: string;
  slug: string;
  descriptionTr: string;
  descriptionEn: string;
  coverImageUrl: string;
  active: boolean;
  sortOrder: number;
}

export interface ArchitectureProject {
  id: string;
  categoryId: string;
  titleTr: string;
  titleEn: string;
  slug: string;
  shortDescriptionTr: string;
  shortDescriptionEn: string;
  detailedDescriptionTr: string;
  detailedDescriptionEn: string;
  subtitleTr: string;
  subtitleEn: string;
  coverImageUrl: string;
  galleryImageUrls: string[];
  locationTr: string;
  locationEn: string;
  statusTr: string;
  statusEn: string;
  year: string;
  active: boolean;
  featured: boolean;
  sortOrder: number;
}

export interface SocialLinks {
  instagram: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  addressTr: string;
  addressEn: string;
  whatsappGeneral: string;
  whatsappFleet: string;
  whatsappConstruction: string;
  whatsappArchitecture: string;
  // Legacy fallback field; kept for backward compatibility.
  whatsapp: string;
  mapEmbedUrl: string;
  mapLinkUrl: string;
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
  videoUrl: string;
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
  fleetInformation: FleetInformationContent;
  projectCardTexts: ProjectCardTextGroups;
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

export interface IncludedServiceItem {
  id: string;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  icon: string;
}

export interface FleetInformationContent {
  servicesText: string;
  termsText: string;
  userRulesText: string;
  insurancePrivilegesTitleTr?: string;
  insurancePrivilegesTitleEn?: string;
  insurancePrivilegesTextTr?: string;
  insurancePrivilegesTextEn?: string;
  whySimsekogluTitleTr?: string;
  whySimsekogluTitleEn?: string;
  whySimsekogluTextTr?: string;
  whySimsekogluTextEn?: string;
  legalNoteMain: string;
  legalNoteSub: string;
  includedServices: IncludedServiceItem[];
}

export interface ProjectCardTextContent {
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  locationTr: string;
  locationEn: string;
}

export interface ProjectCardTextGroups {
  construction: Record<string, ProjectCardTextContent>;
  architecture: Record<string, ProjectCardTextContent>;
}
