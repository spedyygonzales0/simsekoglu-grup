import { defaultSiteContent } from "@/lib/data/default-site-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { readSiteContent, writeSiteContent } from "@/lib/storage/client";
import { RentalPackage, Vehicle, VehicleCategory } from "@/lib/types";

interface VehicleRow {
  id: string;
  brand: string;
  model: string;
  model_year_label: string | null;
  categories: unknown;
  image_urls: unknown;
  rental_packages: unknown;
  description_tr: string | null;
  description_en: string | null;
  services_tr: string | null;
  terms_tr: string | null;
  user_rules_tr: string | null;
  active: boolean | null;
  featured: boolean | null;
}

interface VehicleExtraFields {
  insuranceBenefitsEn?: string;
  whyChooseFleetEn?: string;
}

const VALID_CATEGORIES: VehicleCategory[] = [
  "suv",
  "electric",
  "economy",
  "luxury",
  "commercial",
  "sedan",
  "hatchback",
  "van"
];

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeCategory(value: unknown): VehicleCategory | null {
  if (typeof value !== "string") return null;
  const normalized = value.toLowerCase().trim() as VehicleCategory;
  return VALID_CATEGORIES.includes(normalized) ? normalized : null;
}

function normalizeCategories(input: unknown): VehicleCategory[] {
  if (!Array.isArray(input)) return [];
  const normalized = input.map(normalizeCategory).filter((item): item is VehicleCategory => Boolean(item));
  return Array.from(new Set(normalized));
}

function normalizeImageList(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return Array.from(
    new Set(
      input
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => Boolean(item))
    )
  );
}

function normalizePrice(value: unknown): number | null {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function normalizeRentalPackages(input: unknown): RentalPackage[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((pkg, index) => {
      if (!pkg || typeof pkg !== "object") return null;
      const item = pkg as Partial<RentalPackage>;
      const fuelType = item.fuelType;
      const transmission = item.transmission;
      if (!fuelType || !transmission) return null;
      return {
        id: item.id?.trim() || `pkg-${index + 1}`,
        fuelType,
        transmission,
        prices: {
          1000: normalizePrice(item.prices?.[1000]),
          2000: normalizePrice(item.prices?.[2000]),
          3000: normalizePrice(item.prices?.[3000])
        }
      } as RentalPackage;
    })
    .filter((item): item is RentalPackage => Boolean(item));
}

function mapRowToVehicle(row: VehicleRow): Vehicle {
  const categories = normalizeCategories(row.categories);
  const primaryCategory = categories[0] || "economy";
  const secondaryCategories = categories.slice(1).filter((item) => item !== primaryCategory);
  const images = normalizeImageList(row.image_urls);
  const mainImage = images[0] || "/images/fleet/vehicle-placeholder.svg";
  const galleryImages = images.length ? images : [mainImage];
  const rentalPackages = normalizeRentalPackages(row.rental_packages);

  let extraFields: VehicleExtraFields = {};
  if (row.user_rules_tr) {
    try {
      const parsed = JSON.parse(row.user_rules_tr) as VehicleExtraFields;
      if (parsed && typeof parsed === "object") extraFields = parsed;
    } catch {
      extraFields = {};
    }
  }

  return {
    id: row.id,
    brand: row.brand || "Marka",
    model: row.model || "Model",
    modelYearLabel: row.model_year_label || "2024+",
    slug: toSlug(`${row.brand || "marka"}-${row.model || "model"}`),
    primaryCategory,
    secondaryCategories,
    infoTr: row.description_tr || "",
    infoEn: row.description_en || "",
    insuranceBenefitsTr: row.services_tr || "",
    insuranceBenefitsEn: extraFields.insuranceBenefitsEn || "",
    whyChooseFleetTr: row.terms_tr || "",
    whyChooseFleetEn: extraFields.whyChooseFleetEn || "",
    // Legacy alanlar geriye uyumluluk için tutulur.
    servicesText: row.services_tr || "",
    termsText: row.terms_tr || "",
    userRulesText: "",
    officialUrl: "",
    mainImage,
    galleryImages,
    carouselActive: galleryImages.length > 1,
    carouselSpeed: "normal",
    featured: Boolean(row.featured),
    active: row.active !== false,
    rentalPackages,
    variants: []
  };
}

function mapVehicleToRow(vehicle: Omit<Vehicle, "id"> | Vehicle) {
  const categories = Array.from(
    new Set([vehicle.primaryCategory, ...(vehicle.secondaryCategories || [])].filter(Boolean))
  );
  const imageUrls = Array.from(
    new Set([vehicle.mainImage, ...(vehicle.galleryImages || [])].filter(Boolean))
  );
  const extraFields: VehicleExtraFields = {
    insuranceBenefitsEn: vehicle.insuranceBenefitsEn || "",
    whyChooseFleetEn: vehicle.whyChooseFleetEn || ""
  };

  return {
    ...(isUuid((vehicle as Vehicle).id || "") ? { id: (vehicle as Vehicle).id } : {}),
    brand: vehicle.brand.trim(),
    model: vehicle.model.trim(),
    model_year_label: vehicle.modelYearLabel?.trim() || "2024+",
    categories,
    image_urls: imageUrls,
    rental_packages: vehicle.rentalPackages || [],
    description_tr: vehicle.infoTr || "",
    description_en: vehicle.infoEn || "",
    services_tr: vehicle.insuranceBenefitsTr || "",
    terms_tr: vehicle.whyChooseFleetTr || "",
    user_rules_tr: JSON.stringify(extraFields),
    active: vehicle.active !== false,
    featured: Boolean(vehicle.featured)
  };
}

function readFallbackVehicles(): Vehicle[] {
  const localVehicles = readSiteContent().vehicles;
  if (Array.isArray(localVehicles) && localVehicles.length) return localVehicles;
  return defaultSiteContent.vehicles;
}

function writeFallbackVehicles(vehicles: Vehicle[]): void {
  const current = readSiteContent();
  writeSiteContent({
    ...current,
    vehicles
  });
}

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data, error } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
    if (!error && data && data.length) {
      return data.map((row) => mapRowToVehicle(row as VehicleRow));
    }
  }
  return readFallbackVehicles();
}

export async function createVehicle(vehicle: Omit<Vehicle, "id"> | Vehicle): Promise<Vehicle> {
  const payload = mapVehicleToRow(vehicle);
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase.from("vehicles").insert(payload).select("*").single();
    if (!error && data) {
      return mapRowToVehicle(data as VehicleRow);
    }
  }

  const fallbackVehicles = readFallbackVehicles();
  const nextVehicle: Vehicle = {
    ...(vehicle as Vehicle),
    id: (vehicle as Vehicle).id || `v-${Math.random().toString(36).slice(2, 10)}`
  };
  writeFallbackVehicles([nextVehicle, ...fallbackVehicles]);
  return nextVehicle;
}

export async function updateVehicle(id: string, partial: Partial<Vehicle>): Promise<Vehicle | null> {
  const fallbackVehicles = readFallbackVehicles();
  const current = fallbackVehicles.find((item) => item.id === id);
  if (!current) return null;
  const merged = { ...current, ...partial, id };
  const payload = mapVehicleToRow(merged);
  const supabase = getSupabaseBrowserClient();

  if (supabase && isUuid(id)) {
    const { data, error } = await supabase.from("vehicles").update(payload).eq("id", id).select("*").single();
    if (!error && data) {
      const updated = mapRowToVehicle(data as VehicleRow);
      const nextLocal = fallbackVehicles.map((item) => (item.id === id ? updated : item));
      writeFallbackVehicles(nextLocal);
      return updated;
    }
  }

  const updated = merged as Vehicle;
  const nextLocal = fallbackVehicles.map((item) => (item.id === id ? updated : item));
  writeFallbackVehicles(nextLocal);
  return updated;
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (supabase && isUuid(id)) {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (!error) {
      const nextLocal = readFallbackVehicles().filter((item) => item.id !== id);
      writeFallbackVehicles(nextLocal);
      return true;
    }
  }

  const nextLocal = readFallbackVehicles().filter((item) => item.id !== id);
  writeFallbackVehicles(nextLocal);
  return true;
}
