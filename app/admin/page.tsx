"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { StatusBadge } from "@/components/shared/status-badge";
import { currencyTl, requestStatusLabel, serviceTypeLabel, vehicleCategoryLabel } from "@/lib/i18n";
import {
  AboutContent,
  ArchitectureContent,
  CarouselSpeed,
  ConstructionContent,
  ContactInfo,
  FuelType,
  HomeContent,
  Project,
  ProjectCategory,
  ProjectStatus,
  QuoteRequest,
  QuoteRequestStatus,
  RentalPackage,
  RentalKm,
  SettingsContent,
  TransmissionType,
  Vehicle,
  VehicleCategory,
} from "@/lib/types";

type AdminTab =
  | "dashboard"
  | "vehicles"
  | "projects"
  | "architecture-content"
  | "construction-content"
  | "homepage-content"
  | "contact-settings"
  | "media-library"
  | "requests"
  | "settings";

type VehicleWizardStep = 1 | 2 | 3 | 4;
type VehicleStatusFilter = "all" | "active" | "passive";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "dashboard", label: "Panel" },
  { id: "vehicles", label: "Araçlar" },
  { id: "projects", label: "Projeler" },
  { id: "architecture-content", label: "Mimarlık İçerikleri" },
  { id: "construction-content", label: "İnşaat İçerikleri" },
  { id: "homepage-content", label: "Ana Sayfa İçeriği" },
  { id: "contact-settings", label: "İletişim Ayarları" },
  { id: "media-library", label: "Medya Kütüphanesi" },
  { id: "requests", label: "Teklif Talepleri" },
  { id: "settings", label: "Ayarlar" }
];

const requestStatusOptions: QuoteRequestStatus[] = ["pending", "contacted", "closed"];
const projectStatusOptions: ProjectStatus[] = ["completed", "ongoing", "planned"];
const projectCategoryOptions: ProjectCategory[] = ["construction", "architecture", "fleet"];
const vehicleCategoryOptions: VehicleCategory[] = [
  "suv",
  "electric",
  "economy",
  "luxury",
  "commercial",
  "sedan",
  "hatchback",
  "van"
];
const fuelOptions: FuelType[] = ["Benzin", "Dizel", "Hibrit", "Elektrikli"];
const ELECTRIC_FUEL: FuelType = "Elektrikli";
const transmissionOptions: TransmissionType[] = ["Otomatik", "Manuel"];
const carouselSpeedOptions: CarouselSpeed[] = ["slow", "normal", "fast"];
const KM_VALUES: RentalKm[] = [1000, 2000, 3000];

const VEHICLE_PLACEHOLDER_IMAGE = "/images/fleet/vehicle-placeholder.svg";

const createRentalPackage = (): RentalPackage => ({
  id: `pkg-${Math.random().toString(36).slice(2, 9)}`,
  fuelType: "Benzin",
  transmission: "Otomatik",
  prices: { 1000: null, 2000: null, 3000: null }
});

const createDefaultVehicleForm = (): Omit<Vehicle, "id"> => ({
  brand: "",
  model: "",
  modelYearLabel: "2024+",
  slug: "",
  primaryCategory: "economy",
  secondaryCategories: [],
  infoTr: "",
  infoEn: "",
  officialUrl: "",
  mainImage: VEHICLE_PLACEHOLDER_IMAGE,
  galleryImages: [VEHICLE_PLACEHOLDER_IMAGE],
  carouselActive: true,
  carouselSpeed: "normal",
  featured: false,
  active: true,
  rentalPackages: [],
  variants: []
});

const defaultProjectForm: Omit<Project, "id"> = {
  titleTr: "",
  titleEn: "",
  summaryTr: "",
  summaryEn: "",
  descriptionTr: "",
  descriptionEn: "",
  locationTr: "İstanbul",
  locationEn: "Istanbul",
  date: new Date().toISOString().slice(0, 7),
  status: "planned",
  category: "construction",
  featuredImage: "/images/construction/project-placeholder-1.svg",
  galleryImages: ["/images/construction/project-placeholder-1.svg"],
  carouselActive: true,
  carouselSpeed: "normal",
  imageUrl: "/images/construction/project-placeholder-1.svg",
  videoUrl: "/images/construction/video-placeholder.svg",
  featured: false
};

function SectionCard({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-navy-900/10 bg-white p-7 shadow-soft">
      <h2 className="section-title text-[2rem]">{title}</h2>
      {description ? <p className="mt-2 body-text text-navy-900/68">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function InputField({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1">
      <span className="admin-label">{label}</span>
      {children}
    </label>
  );
}

function buildSlug(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeVehicleIdentity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function vehicleIdentityKey(brand: string, model: string): string {
  return `${normalizeVehicleIdentity(brand)}::${normalizeVehicleIdentity(model)}`;
}

function packageKey(option: Pick<RentalPackage, "fuelType" | "transmission">): string {
  return [
    option.fuelType,
    option.transmission
  ].join("|");
}

function requestSubject(request: QuoteRequest, locale: "tr" | "en"): string {
  return (
    request.selectedVariantLabel ||
    request.selectedVehicleLabel ||
    request.selectedProjectLabel ||
    serviceTypeLabel(request.serviceType, locale)
  );
}

function nextRequestStatus(status: QuoteRequestStatus): QuoteRequestStatus {
  if (status === "pending") return "contacted";
  if (status === "contacted") return "closed";
  return "pending";
}

function carouselSpeedLabelTr(speed: CarouselSpeed): string {
  if (speed === "slow") return "Yavaş";
  if (speed === "fast") return "Hızlı";
  return "Normal";
}

function toVehicleForm(vehicle: Vehicle): Omit<Vehicle, "id"> {
  const galleryImages = Array.from(
    new Set([vehicle.mainImage || VEHICLE_PLACEHOLDER_IMAGE, ...(vehicle.galleryImages || [])].filter(Boolean))
  );

  return {
    brand: vehicle.brand,
    model: vehicle.model,
    modelYearLabel: vehicle.modelYearLabel || "2024+",
    slug: vehicle.slug,
    primaryCategory: vehicle.primaryCategory,
    secondaryCategories: vehicle.secondaryCategories,
    infoTr: vehicle.infoTr || "",
    infoEn: vehicle.infoEn || "",
    officialUrl: vehicle.officialUrl || "",
    mainImage: vehicle.mainImage || VEHICLE_PLACEHOLDER_IMAGE,
    galleryImages,
    carouselActive: vehicle.carouselActive ?? galleryImages.length > 1,
    carouselSpeed: vehicle.carouselSpeed ?? "normal",
    featured: vehicle.featured,
    active: vehicle.active,
    rentalPackages: (vehicle.rentalPackages || []).map((pkg) => ({
      id: pkg.id || `pkg-${Math.random().toString(36).slice(2, 9)}`,
      fuelType: pkg.fuelType,
      transmission: pkg.transmission,
      prices: {
        1000: typeof pkg.prices?.[1000] === "number" ? Number(pkg.prices[1000]) : null,
        2000: typeof pkg.prices?.[2000] === "number" ? Number(pkg.prices[2000]) : null,
        3000: typeof pkg.prices?.[3000] === "number" ? Number(pkg.prices[3000]) : null
      }
    })),
    variants: []
  };
}

export default function AdminPage() {
  const {
    locale,
    content,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
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
    quoteRequests,
    updateQuoteRequestStatus,
    deleteQuoteRequest
  } = useSiteData();

  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");

  const [vehicleForm, setVehicleForm] = useState<Omit<Vehicle, "id">>(createDefaultVehicleForm);
  const [vehicleWizardStep, setVehicleWizardStep] = useState<VehicleWizardStep>(1);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState<"all" | VehicleCategory>("all");
  const [vehicleFuelFilter, setVehicleFuelFilter] = useState<"all" | FuelType>("all");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState<VehicleStatusFilter>("all");
  const [showAdvancedVehicleTools, setShowAdvancedVehicleTools] = useState(false);
  const [vehicleEditId, setVehicleEditId] = useState<string | null>(null);
  const [vehiclePackageIndex, setVehiclePackageIndex] = useState(0);
  const [vehicleMediaPathInput, setVehicleMediaPathInput] = useState("");
  const [projectForm, setProjectForm] = useState<Omit<Project, "id">>(defaultProjectForm);
  const [projectEditId, setProjectEditId] = useState<string | null>(null);
  const [projectMediaPathInput, setProjectMediaPathInput] = useState("");

  const [homeForm, setHomeForm] = useState<HomeContent>(content.home);
  const [aboutForm, setAboutForm] = useState<AboutContent>(content.about);
  const [constructionForm, setConstructionForm] = useState<ConstructionContent>(content.construction);
  const [architectureForm, setArchitectureForm] = useState<ArchitectureContent>(content.architecture);
  const [contactForm, setContactForm] = useState<ContactInfo>(content.contact);
  const [settingsForm, setSettingsForm] = useState<SettingsContent>(content.settings);
  const [mediaText, setMediaText] = useState(content.mediaLibrary.join("\n"));
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    setHomeForm(content.home);
    setAboutForm(content.about);
    setConstructionForm(content.construction);
    setArchitectureForm(content.architecture);
    setContactForm(content.contact);
    setSettingsForm(content.settings);
    setMediaText(content.mediaLibrary.join("\n"));
  }, [content]);

  const summary = useMemo(
    () => ({
      activeVehicles: content.vehicles.filter((v) => v.active).length,
      featuredVehicles: content.vehicles.filter((v) => v.featured).length,
      totalProjects: content.projects.length,
      pendingRequests: quoteRequests.filter((r) => r.status === "pending").length
    }),
    [content.projects.length, content.vehicles, quoteRequests]
  );

  const setupChecklist = useMemo(() => {
    const hasVehicles = content.vehicles.length >= 5;
    const hasProjects = content.projects.length >= 3;
    const hasWhatsapp = Boolean(content.contact.whatsapp?.trim());
    const hasInstagram = Boolean(content.contact.social.instagram?.trim());
    const hasContactBasics = Boolean(content.contact.phone?.trim() && content.contact.email?.trim());
    return [
      {
        label: "Araç portföyü (en az 5 araç)",
        done: hasVehicles
      },
      {
        label: "Proje portföyü (en az 3 proje)",
        done: hasProjects
      },
      {
        label: "WhatsApp iletişim numarası",
        done: hasWhatsapp
      },
      {
        label: "Instagram hesabı",
        done: hasInstagram
      },
      {
        label: "Telefon ve e-posta bilgileri",
        done: hasContactBasics
      }
    ];
  }, [content.contact.email, content.contact.phone, content.contact.social.instagram, content.contact.whatsapp, content.projects.length, content.vehicles.length]);

  const setupCompleted = setupChecklist.filter((item) => item.done).length;

  const vehiclePackage =
    vehicleForm.rentalPackages?.[vehiclePackageIndex] ?? vehicleForm.rentalPackages?.[0] ?? createRentalPackage();
  const vehicleHasElectricPackage = (vehicleForm.rentalPackages || []).some((item) => item.fuelType === ELECTRIC_FUEL);
  const vehicleHasElectricCategory =
    vehicleForm.primaryCategory === "electric" || vehicleForm.secondaryCategories.includes("electric");
  const missingElectricVariantForPrimaryCategory =
    vehicleForm.primaryCategory === "electric" &&
    (vehicleForm.rentalPackages || []).length > 0 &&
    !vehicleHasElectricPackage;
  const suggestElectricCategoryForElectricVariant =
    vehicleHasElectricPackage && !vehicleHasElectricCategory;
  const vehicleFuelOptionsForForm = vehicleForm.primaryCategory === "electric" ? [ELECTRIC_FUEL] : fuelOptions;
  const duplicateVehicleCandidate = useMemo(() => {
    const brand = vehicleForm.brand.trim();
    const model = vehicleForm.model.trim();
    if (!brand || !model) return null;
    const identity = vehicleIdentityKey(brand, model);
    return (
      content.vehicles.find((vehicle) => {
        if (vehicleEditId && vehicle.id === vehicleEditId) return false;
        return vehicleIdentityKey(vehicle.brand, vehicle.model) === identity;
      }) ?? null
    );
  }, [content.vehicles, vehicleEditId, vehicleForm.brand, vehicleForm.model]);

  const filteredVehicles = useMemo(() => {
    return content.vehicles.filter((vehicle) => {
      const text = `${vehicle.brand} ${vehicle.model}`.toLowerCase();
      if (vehicleSearch.trim() && !text.includes(vehicleSearch.trim().toLowerCase())) return false;
      if (vehicleCategoryFilter !== "all") {
        const hasCategory =
          vehicle.primaryCategory === vehicleCategoryFilter ||
          vehicle.secondaryCategories.includes(vehicleCategoryFilter);
        if (!hasCategory) return false;
      }
      if (vehicleFuelFilter !== "all") {
        const hasFuel = (vehicle.rentalPackages || []).some(
          (item) => item.fuelType === vehicleFuelFilter
        );
        if (!hasFuel) return false;
      }
      if (vehicleStatusFilter === "active" && !vehicle.active) return false;
      if (vehicleStatusFilter === "passive" && vehicle.active) return false;
      return true;
    });
  }, [content.vehicles, vehicleCategoryFilter, vehicleFuelFilter, vehicleSearch, vehicleStatusFilter]);

  const setVehiclePackage = <K extends keyof RentalPackage>(index: number, key: K, value: RentalPackage[K]) => {
    setVehicleForm((prev) => {
      const nextPackages = prev.rentalPackages?.length ? [...prev.rentalPackages] : [createRentalPackage()];
      const current = nextPackages[index] ?? createRentalPackage();
      nextPackages[index] = { ...current, [key]: value };
      return { ...prev, rentalPackages: nextPackages };
    });
  };

  const setVehiclePackagePrice = (index: number, km: RentalKm, value: string) => {
    const num = Number(value);
    setVehicleForm((prev) => {
      const nextPackages = prev.rentalPackages?.length ? [...prev.rentalPackages] : [createRentalPackage()];
      const current = nextPackages[index] ?? createRentalPackage();
      nextPackages[index] = {
        ...current,
        prices: {
          ...(current.prices || { 1000: null, 2000: null, 3000: null }),
          [km]: Number.isFinite(num) && num > 0 ? num : null
        }
      };
      return { ...prev, rentalPackages: nextPackages };
    });
  };

  const addVehiclePackage = () => {
    let nextIndex = 0;
    setVehicleForm((prev) => {
      const nextOption = createRentalPackage();
      if (prev.primaryCategory === "electric") {
        nextOption.fuelType = "Elektrikli";
      }
      const nextPackages = [...(prev.rentalPackages || []), nextOption];
      nextIndex = nextPackages.length - 1;
      return { ...prev, rentalPackages: nextPackages };
    });
    setVehiclePackageIndex(nextIndex);
  };

  const removeVehiclePackage = (index: number) => {
    let nextIndex = 0;
    setVehicleForm((prev) => {
      const current = prev.rentalPackages || [];
      if (current.length <= 1) return prev;
      const nextPackages = current.filter((_, idx) => idx !== index);
      nextIndex = Math.min(index, Math.max(0, nextPackages.length - 1));
      return { ...prev, rentalPackages: nextPackages };
    });
    setVehiclePackageIndex(nextIndex);
  };

  useEffect(() => {
    const packageLength = (vehicleForm.rentalPackages || []).length;
    if (vehiclePackageIndex > 0 && vehiclePackageIndex >= packageLength) {
      setVehiclePackageIndex(Math.max(0, packageLength - 1));
    }
  }, [vehicleForm.rentalPackages, vehiclePackageIndex]);

  useEffect(() => {
    if (vehicleForm.primaryCategory === "electric") {
      setVehicleForm((prev) => {
        const normalizedPackages: RentalPackage[] = (prev.rentalPackages || []).map((option) => ({
          ...option,
          fuelType: "Elektrikli" as RentalPackage["fuelType"]
        }));
        return { ...prev, rentalPackages: normalizedPackages };
      });
    }
  }, [vehicleForm.primaryCategory]);

  const cleanMediaPath = (value: string) => value.trim();

  const addVehicleGalleryImage = () => {
    const path = cleanMediaPath(vehicleMediaPathInput);
    if (!path) return;
    setVehicleForm((prev) => {
      const nextGallery = Array.from(new Set([...(prev.galleryImages || []), path]));
      return {
        ...prev,
        galleryImages: nextGallery,
        mainImage: prev.mainImage || path
      };
    });
    setVehicleMediaPathInput("");
  };

  const setVehicleMainImage = (path: string) => {
    setVehicleForm((prev) => ({
      ...prev,
      mainImage: path,
      galleryImages: Array.from(new Set([path, ...(prev.galleryImages || [])]))
    }));
  };

  const removeVehicleGalleryImage = (path: string) => {
    setVehicleForm((prev) => {
      const nextGallery = (prev.galleryImages || []).filter((item) => item !== path);
      const nextMainImage =
        prev.mainImage === path ? nextGallery[0] || VEHICLE_PLACEHOLDER_IMAGE : prev.mainImage;
      return {
        ...prev,
        mainImage: nextMainImage,
        galleryImages: nextGallery.length ? nextGallery : [nextMainImage]
      };
    });
  };

  const moveVehicleGalleryImage = (index: number, direction: "up" | "down") => {
    setVehicleForm((prev) => {
      const current = [...(prev.galleryImages || [])];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return prev;
      [current[index], current[target]] = [current[target], current[index]];
      return {
        ...prev,
        galleryImages: current
      };
    });
  };

  const addProjectGalleryImage = () => {
    const path = cleanMediaPath(projectMediaPathInput);
    if (!path) return;
    setProjectForm((prev) => {
      const nextGallery = Array.from(new Set([...(prev.galleryImages || []), path]));
      return {
        ...prev,
        featuredImage: prev.featuredImage || path,
        imageUrl: prev.imageUrl || path,
        galleryImages: nextGallery
      };
    });
    setProjectMediaPathInput("");
  };

  const setProjectFeaturedImage = (path: string) => {
    setProjectForm((prev) => ({
      ...prev,
      featuredImage: path,
      imageUrl: path,
      galleryImages: Array.from(new Set([path, ...(prev.galleryImages || [])]))
    }));
  };

  const removeProjectGalleryImage = (path: string) => {
    setProjectForm((prev) => {
      const nextGallery = (prev.galleryImages || []).filter((item) => item !== path);
      const fallbackImage = nextGallery[0] || prev.imageUrl || "/images/construction/project-placeholder-1.svg";
      return {
        ...prev,
        featuredImage: prev.featuredImage === path ? fallbackImage : prev.featuredImage,
        imageUrl: prev.imageUrl === path ? fallbackImage : prev.imageUrl,
        galleryImages: nextGallery.length ? nextGallery : [fallbackImage]
      };
    });
  };

  const moveProjectGalleryImage = (index: number, direction: "up" | "down") => {
    setProjectForm((prev) => {
      const current = [...(prev.galleryImages || [])];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return prev;
      [current[index], current[target]] = [current[target], current[index]];
      return {
        ...prev,
        galleryImages: current
      };
    });
  };

  const flashSaved = (text: string) => {
    setSaved(text);
    setTimeout(() => setSaved(""), 1500);
  };

  const onAdminLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = loginAdmin(username, password);
    if (!ok) {
      setLoginError("Kullanıcı adı veya şifre hatalı.");
      return;
    }
    setLoginError("");
  };

  const onVehicleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedPackages = (vehicleForm.rentalPackages || []).map((pkg, index) => ({
      id: pkg.id || `pkg-${Math.random().toString(36).slice(2, 9)}`,
      fuelType: pkg.fuelType as RentalPackage["fuelType"],
      transmission: pkg.transmission,
      prices: {
        1000: Number(pkg.prices?.[1000]) > 0 ? Number(pkg.prices?.[1000]) : null,
        2000: Number(pkg.prices?.[2000]) > 0 ? Number(pkg.prices?.[2000]) : null,
        3000: Number(pkg.prices?.[3000]) > 0 ? Number(pkg.prices?.[3000]) : null
      }
    }));

    const packageKeys = new Set<string>();
    for (const pkg of normalizedPackages) {
      const key = packageKey(pkg);
      if (packageKeys.has(key)) {
        alert("Bu yakıt ve vites paketi zaten eklenmiş.");
        setVehicleWizardStep(2);
        return;
      }
      packageKeys.add(key);
    }

    const normalizedGallery = Array.from(
      new Set([vehicleForm.mainImage || VEHICLE_PLACEHOLDER_IMAGE, ...(vehicleForm.galleryImages || [])].filter(Boolean))
    );
    const payload: Omit<Vehicle, "id"> = {
      ...vehicleForm,
      modelYearLabel: vehicleForm.modelYearLabel?.trim() || "2024+",
      slug: buildSlug(vehicleForm.brand, vehicleForm.model),
      secondaryCategories: vehicleForm.secondaryCategories.filter(
        (item) => item !== vehicleForm.primaryCategory
      ),
      mainImage: vehicleForm.mainImage || VEHICLE_PLACEHOLDER_IMAGE,
      galleryImages: normalizedGallery,
      carouselActive: vehicleForm.carouselActive ?? normalizedGallery.length > 1,
      carouselSpeed: vehicleForm.carouselSpeed ?? "normal",
      rentalPackages: normalizedPackages,
      variants: []
    };

    if (!payload.brand.trim() || !payload.model.trim()) {
      alert("Lütfen marka ve model alanlarını doldurun.");
      return;
    }

    if (
      payload.primaryCategory === "electric" &&
      payload.rentalPackages.length > 0 &&
      !payload.rentalPackages.some((item) => item.fuelType === ELECTRIC_FUEL)
    ) {
      alert("Ana kategori Elektrikli ise en az bir kiralama paketinin yakıt tipi Elektrikli olmalıdır.");
      setVehicleWizardStep(2);
      return;
    }

    if (duplicateVehicleCandidate) {
      const wantsVariantMerge = window.confirm("Bu araç zaten var. Yeni bir kiralama paketi eklemek ister misiniz?");
      if (!wantsVariantMerge) return;

      const existingPackageKeys = new Set(
        (duplicateVehicleCandidate.rentalPackages || []).map((item) => packageKey(item))
      );
      const incomingUniquePackages = payload.rentalPackages.filter(
        (item) => !existingPackageKeys.has(packageKey(item))
      );

      const nextPackages = incomingUniquePackages.length
        ? [...(duplicateVehicleCandidate.rentalPackages || []), ...incomingUniquePackages]
        : duplicateVehicleCandidate.rentalPackages || [];

      const nextSecondaryCategories = Array.from(
        new Set([
          ...duplicateVehicleCandidate.secondaryCategories,
          payload.primaryCategory,
          ...payload.secondaryCategories
        ])
      ).filter((category) => category !== duplicateVehicleCandidate.primaryCategory);

      const nextGalleryImages = Array.from(
        new Set([
          duplicateVehicleCandidate.mainImage,
          ...(duplicateVehicleCandidate.galleryImages || []),
          payload.mainImage,
          ...(payload.galleryImages || [])
        ].filter(Boolean))
      );

      updateVehicle(duplicateVehicleCandidate.id, {
        secondaryCategories: nextSecondaryCategories,
        mainImage: duplicateVehicleCandidate.mainImage || payload.mainImage,
        galleryImages: nextGalleryImages,
        carouselActive: duplicateVehicleCandidate.carouselActive ?? nextGalleryImages.length > 1,
        carouselSpeed: duplicateVehicleCandidate.carouselSpeed || payload.carouselSpeed,
        featured: duplicateVehicleCandidate.featured || payload.featured,
        active: duplicateVehicleCandidate.active || payload.active,
        rentalPackages: nextPackages,
        variants: []
      });

      if (vehicleEditId && vehicleEditId !== duplicateVehicleCandidate.id) {
        deleteVehicle(vehicleEditId);
      }

      setVehicleEditId(null);
      setVehicleForm(createDefaultVehicleForm());
      setVehicleMediaPathInput("");
      setVehiclePackageIndex(0);
      setVehicleWizardStep(1);
      flashSaved(
        incomingUniquePackages.length
          ? `${incomingUniquePackages.length} kiralama paketi mevcut araca eklendi.`
          : "Araç bilgileri güncellendi."
      );
      return;
    }

    if (vehicleEditId) updateVehicle(vehicleEditId, payload);
    else addVehicle(payload);

    setVehicleEditId(null);
    setVehicleForm(createDefaultVehicleForm());
    setVehicleMediaPathInput("");
    setVehiclePackageIndex(0);
    setVehicleWizardStep(1);
    flashSaved(vehicleEditId ? "Araç güncellendi." : "Araç eklendi.");
  };

  const goToVehicleStep = (nextStep: VehicleWizardStep) => {
    if (nextStep === 2 && (!vehicleForm.brand.trim() || !vehicleForm.model.trim())) {
      alert("Önce marka ve model bilgilerini girin.");
      return;
    }
    setVehicleWizardStep(nextStep);
  };

  const resetVehicleForm = () => {
    setVehicleEditId(null);
    setVehicleForm(createDefaultVehicleForm());
    setVehicleMediaPathInput("");
    setVehiclePackageIndex(0);
    setVehicleWizardStep(1);
  };

  const onProjectSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fallbackImage =
      projectForm.featuredImage ||
      projectForm.imageUrl ||
      (projectForm.category === "architecture"
        ? "/images/architecture/project-placeholder-1.svg"
        : projectForm.category === "fleet"
          ? "/images/fleet/vehicle-placeholder.svg"
          : "/images/construction/project-placeholder-1.svg");

    const normalizedGallery = Array.from(
      new Set([fallbackImage, ...(projectForm.galleryImages || [])].filter(Boolean))
    );

    const payload: Omit<Project, "id"> = {
      ...projectForm,
      featuredImage: fallbackImage,
      imageUrl: fallbackImage,
      galleryImages: normalizedGallery,
      carouselActive: projectForm.carouselActive ?? normalizedGallery.length > 1,
      carouselSpeed: projectForm.carouselSpeed ?? "normal"
    };

    if (projectEditId) updateProject(projectEditId, payload);
    else addProject(payload);
    setProjectEditId(null);
    setProjectForm(defaultProjectForm);
    setProjectMediaPathInput("");
  };

  if (!isAdminAuthenticated) {
    return (
      <main className="admin-surface flex min-h-screen items-center justify-center bg-cloud-100 p-6">
        <form onSubmit={onAdminLogin} className="w-full max-w-md rounded-2xl bg-white p-9 shadow-soft">
          <h1 className="font-display text-3xl text-navy-900">Yönetim Girişi</h1>
          <p className="mt-2 body-text text-navy-900/70">
            Geçici giriş bilgileri: <strong>admin / admin123</strong>
          </p>
          <div className="mt-7 space-y-5">
            <InputField label="Kullanıcı Adı">
              <input
                className="admin-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </InputField>
            <InputField label="Şifre">
              <input
                type="password"
                className="admin-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </InputField>
          </div>
          {loginError ? <p className="mt-3 text-base text-red-600">{loginError}</p> : null}
          <button
            type="submit"
            className="mt-7 w-full rounded-lg bg-navy-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-navy-700"
          >
            Giriş Yap
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-surface min-h-screen bg-cloud-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 flex-col bg-navy-900 text-white md:flex">
          <div className="border-b border-white/10 px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.1em] text-gold-300">Yönetim Paneli</p>
            <h1 className="mt-3 font-display text-2xl">Şimşekoğlu Grup</h1>
            <p className="mt-2 text-sm text-white/70">Kurumsal İçerik Yönetimi</p>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`w-full rounded-xl px-4 py-3.5 text-left text-base font-semibold transition ${
                  tab === item.id ? "bg-gold-500 text-navy-900" : "text-white/85 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="border-t border-white/10 p-4">
            <button
              type="button"
              onClick={logoutAdmin}
              className="w-full rounded-lg border border-white/25 px-4 py-3 text-base font-semibold text-white transition hover:bg-white hover:text-navy-900"
            >
              Çıkış Yap
            </button>
          </div>
        </aside>

        <section className="flex-1 p-4 md:p-8">
          <div className="mb-4 md:hidden">
            <select
              value={tab}
              onChange={(event) => setTab(event.target.value as AdminTab)}
              className="admin-input rounded-xl font-semibold"
            >
              {tabs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {saved ? (
            <div className="mb-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-base text-green-700">
              {saved}
            </div>
          ) : null}

          {tab === "dashboard" ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm">
                  <p className="text-base text-navy-900/65">Aktif Araç</p>
                  <p className="mt-2 font-display text-3xl text-navy-900">{summary.activeVehicles}</p>
                </div>
                <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm">
                  <p className="text-base text-navy-900/65">Öne Çıkan Araç</p>
                  <p className="mt-2 font-display text-3xl text-navy-900">{summary.featuredVehicles}</p>
                </div>
                <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm">
                  <p className="text-base text-navy-900/65">Toplam Proje</p>
                  <p className="mt-2 font-display text-3xl text-navy-900">{summary.totalProjects}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab("requests")}
                  className="rounded-2xl border border-navy-900/10 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gold-500/45 hover:shadow-md"
                >
                  <p className="text-base text-navy-900/65">Bekleyen Talep</p>
                  <p className="mt-2 font-display text-3xl text-navy-900">{summary.pendingRequests}</p>
                  <p className="mt-2 text-sm font-semibold tracking-[0.03em] text-gold-600">
                    Teklif Taleplerine Git
                  </p>
                </button>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <SectionCard
                  title="Yayına Hazırlık Kontrolü"
                  description={`${setupCompleted}/${setupChecklist.length} adım tamamlandı.`}
                >
                  <div className="space-y-2">
                    {setupChecklist.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl border border-navy-900/10 bg-cloud-50 px-4 py-3 text-sm"
                      >
                        <span className="text-navy-900">{item.label}</span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.done ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.done ? "Tamamlandı" : "Eksik"}
                        </span>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Sonraki Öneriler" description="Yayına çıkmadan önce önerilen son adımlar.">
                  <ul className="space-y-2 text-sm text-navy-900/75">
                    <li>• Alan adı yönlendirmesini canlı sunucuya bağlayın.</li>
                    <li>• Google Search Console ve Analytics kurulumunu tamamlayın.</li>
                    <li>• Tüm iletişim ve teklif akışını mobilde son kez test edin.</li>
                    <li>• Gerçek proje ve mimarlık görsellerini placeholder alanlarına yükleyin.</li>
                    <li>• Haftalık yedekleme ve içerik güncelleme takvimi belirleyin.</li>
                  </ul>
                </SectionCard>
              </div>
            </div>
          ) : null}

          {tab === "vehicles" ? (
            <div className="space-y-6">
              <SectionCard
                title={vehicleEditId ? "Araç Düzenleme Sihirbazı" : "Yeni Araç Ekleme Sihirbazı"}
                description="Kod, dosya yolu veya teknik alan girmeden adım adım araç ekleyebilirsiniz."
              >
                <form onSubmit={onVehicleSubmit} className="space-y-6">
                  <div className="grid gap-2 sm:grid-cols-4">
                    {[
                      { step: 1 as VehicleWizardStep, label: "1. Araç Bilgileri" },
                      { step: 2 as VehicleWizardStep, label: "2. Araç Özellikleri" },
                      { step: 3 as VehicleWizardStep, label: "3. Görsel" },
                      { step: 4 as VehicleWizardStep, label: "4. Yayın Durumu" }
                    ].map((item) => (
                      <button
                        key={item.step}
                        type="button"
                        onClick={() => goToVehicleStep(item.step)}
                        className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                          vehicleWizardStep === item.step
                            ? "border-gold-500 bg-gold-50 text-gold-700"
                            : "border-navy-900/15 bg-white text-navy-900/75 hover:border-gold-400"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {vehicleWizardStep === 1 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField label="Marka">
                        <input
                          required
                          value={vehicleForm.brand}
                          onChange={(event) =>
                            setVehicleForm((prev) => ({
                              ...prev,
                              brand: event.target.value
                            }))
                          }
                          className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                          placeholder="Örn: BMW"
                        />
                      </InputField>
                      <InputField label="Model">
                        <input
                          required
                          value={vehicleForm.model}
                          onChange={(event) =>
                            setVehicleForm((prev) => ({
                              ...prev,
                              model: event.target.value
                            }))
                          }
                          className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                          placeholder="Örn: i5 eDrive40"
                        />
                      </InputField>
                      <InputField label="Model Yılı Yazısı">
                        <input
                          value={vehicleForm.modelYearLabel}
                          onChange={(event) =>
                            setVehicleForm((prev) => ({
                              ...prev,
                              modelYearLabel: event.target.value || "2024+"
                            }))
                          }
                          className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                          placeholder="2024+"
                        />
                      </InputField>
                      <InputField label="Ana Kategori">
                        <select
                          value={vehicleForm.primaryCategory}
                          onChange={(event) =>
                            setVehicleForm((prev) => ({
                              ...prev,
                              primaryCategory: event.target.value as VehicleCategory,
                              secondaryCategories: prev.secondaryCategories.filter(
                                (item) => item !== (event.target.value as VehicleCategory)
                              )
                            }))
                          }
                          className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                        >
                          {vehicleCategoryOptions.map((category) => (
                            <option key={category} value={category}>
                              {vehicleCategoryLabel(category, locale)}
                            </option>
                          ))}
                        </select>
                      </InputField>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-navy-900">Ek Kategoriler</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {vehicleCategoryOptions
                            .filter((category) => category !== vehicleForm.primaryCategory)
                            .map((category) => {
                              const selected = vehicleForm.secondaryCategories.includes(category);
                              return (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={() =>
                                    setVehicleForm((prev) => ({
                                      ...prev,
                                      secondaryCategories: selected
                                        ? prev.secondaryCategories.filter((item) => item !== category)
                                        : [...prev.secondaryCategories, category]
                                    }))
                                  }
                                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                    selected
                                      ? "border-gold-500 bg-gold-50 text-gold-700"
                                      : "border-navy-900/20 text-navy-900 hover:border-gold-500"
                                  }`}
                                >
                                  {vehicleCategoryLabel(category, locale)}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                      <InputField label="Araç Bilgisi (TR)">
                        <textarea
                          rows={3}
                          value={vehicleForm.infoTr}
                          onChange={(event) =>
                            setVehicleForm((prev) => ({
                              ...prev,
                              infoTr: event.target.value
                            }))
                          }
                          className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                          placeholder="Araç ile ilgili kısa kurumsal bilgi..."
                        />
                      </InputField>
                      <InputField label="Araç Bilgisi (EN)">
                        <textarea
                          rows={3}
                          value={vehicleForm.infoEn}
                          onChange={(event) =>
                            setVehicleForm((prev) => ({
                              ...prev,
                              infoEn: event.target.value
                            }))
                          }
                          className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                          placeholder="Short corporate vehicle description..."
                        />
                      </InputField>
                      <div className="md:col-span-2">
                        <InputField label="Resmi Site Linki (Opsiyonel)">
                          <input
                            value={vehicleForm.officialUrl}
                            onChange={(event) =>
                              setVehicleForm((prev) => ({
                                ...prev,
                                officialUrl: event.target.value
                              }))
                            }
                            className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                            placeholder="https://..."
                          />
                        </InputField>
                      </div>
                      {duplicateVehicleCandidate ? (
                        <div className="md:col-span-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                          Bu araç zaten var. Yeni bir kiralama paketi eklemek ister misiniz?
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {vehicleWizardStep === 2 ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        Lütfen sadece araçta gerçekten bulunan yakıt, vites ve kilometre seçeneklerini giriniz. Sistem tahmin yapmaz.
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy-900/10 bg-white p-3">
                        <p className="text-sm font-semibold text-navy-900">
                          Araç Kiralama Paketleri: {(vehicleForm.rentalPackages || []).length} adet
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={addVehiclePackage}
                            className="rounded-lg border border-navy-900/20 px-3 py-2 text-xs font-semibold text-navy-900 hover:border-gold-500 hover:text-gold-600"
                          >
                            Paket Ekle
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {(vehicleForm.rentalPackages || []).map((pkg, index) => {
                          const isActive = index === vehiclePackageIndex;
                          return (
                            <button
                              key={pkg.id || index}
                              type="button"
                              onClick={() => setVehiclePackageIndex(index)}
                              className={`rounded-xl border px-4 py-3 text-left transition ${
                                isActive
                                  ? "border-gold-500 bg-gold-50"
                                  : "border-navy-900/15 bg-white hover:border-gold-300"
                              }`}
                            >
                              <p className="text-sm font-semibold text-navy-900">
                                Paket {index + 1}
                              </p>
                              <p className="mt-1 text-xs text-navy-900/65">
                                {pkg.fuelType} • {pkg.transmission}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {(vehicleForm.rentalPackages || []).length ? (
                        <div className="rounded-2xl border border-navy-900/10 bg-cloud-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-navy-900">
                              Düzenlenen Paket: {vehiclePackageIndex + 1}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeVehiclePackage(vehiclePackageIndex)}
                              className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={(vehicleForm.rentalPackages || []).length <= 1}
                            >
                              Paketi Sil
                            </button>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-navy-900/15 bg-white">
                            <table className="min-w-[720px] w-full text-sm">
                              <thead className="bg-cloud-100/70 text-navy-900/70">
                                <tr>
                                  <th className="px-3 py-2 text-left font-semibold">Yakıt Tipi</th>
                                  <th className="px-3 py-2 text-left font-semibold">Vites</th>
                                  <th className="px-3 py-2 text-left font-semibold">1000 KM Fiyatı</th>
                                  <th className="px-3 py-2 text-left font-semibold">2000 KM Fiyatı</th>
                                  <th className="px-3 py-2 text-left font-semibold">3000 KM Fiyatı</th>
                                  <th className="px-3 py-2 text-left font-semibold">İşlem</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(vehicleForm.rentalPackages || []).map((pkg, idx) => (
                                  <tr key={pkg.id || idx} className="border-t border-navy-900/10">
                                    <td className="px-3 py-2">
                                      <select
                                        value={pkg.fuelType}
                                        onChange={(event) =>
                                          setVehiclePackage(idx, "fuelType", event.target.value as RentalPackage["fuelType"])
                                        }
                                        disabled={vehicleForm.primaryCategory === "electric"}
                                        className="w-full rounded-lg border border-navy-900/20 px-2 py-2"
                                      >
                                        {vehicleFuelOptionsForForm.map((item) => (
                                          <option key={item} value={item}>
                                            {item}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="px-3 py-2">
                                      <select
                                        value={pkg.transmission}
                                        onChange={(event) =>
                                          setVehiclePackage(idx, "transmission", event.target.value as TransmissionType)
                                        }
                                        className="w-full rounded-lg border border-navy-900/20 px-2 py-2"
                                      >
                                        {transmissionOptions.map((item) => (
                                          <option key={item} value={item}>
                                            {item}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    {KM_VALUES.map((km) => (
                                      <td key={km} className="px-3 py-2">
                                        <input
                                          type="number"
                                          min={0}
                                          value={pkg.prices?.[km] ?? ""}
                                          onChange={(event) => setVehiclePackagePrice(idx, km, event.target.value)}
                                          className="w-full rounded-lg border border-navy-900/20 px-2 py-2"
                                          placeholder="Boş bırakılabilir"
                                        />
                                      </td>
                                    ))}
                                    <td className="px-3 py-2">
                                      <button
                                        type="button"
                                        onClick={() => removeVehiclePackage(idx)}
                                        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                        disabled={(vehicleForm.rentalPackages || []).length <= 1}
                                      >
                                        Sil
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <InputField label="Yakıt Tipi">
                              <select
                                value={vehiclePackage.fuelType}
                                onChange={(event) =>
                                  setVehiclePackage(
                                    vehiclePackageIndex,
                                    "fuelType",
                                    event.target.value as RentalPackage["fuelType"]
                                  )
                                }
                                disabled={vehicleForm.primaryCategory === "electric"}
                                className="w-full rounded-lg border border-navy-900/20 px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100"
                              >
                                {vehicleFuelOptionsForForm.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </InputField>
                            <InputField label="Vites">
                              <select
                                value={vehiclePackage.transmission}
                                onChange={(event) =>
                                  setVehiclePackage(vehiclePackageIndex, "transmission", event.target.value as TransmissionType)
                                }
                                className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                              >
                                {transmissionOptions.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </InputField>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-navy-900/20 bg-white px-4 py-3 text-sm text-navy-900/70">
                          Henüz kiralama paketi eklenmedi. Paket Ekle butonuyla başlayabilirsiniz.
                        </div>
                      )}

                      {(vehicleForm.rentalPackages || []).length > 0 && missingElectricVariantForPrimaryCategory ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          Ana kategori Elektrikli seçili. En az bir kiralama paketinin yakıt tipi Elektrikli olmalıdır.
                        </div>
                      ) : null}

                      {(vehicleForm.rentalPackages || []).length > 0 && suggestElectricCategoryForElectricVariant ? (
                        <div className="rounded-xl border border-gold-300/60 bg-gold-50 px-4 py-3 text-sm text-gold-700">
                          Kiralama paketinde Elektrikli yakıtı var. Bu aracı Ana Kategori veya Ek Kategoriler içinde
                          Elektrikli olarak işaretlemeniz önerilir.
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {vehicleWizardStep === 3 ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-navy-900/10 bg-cloud-50 p-5">
                        <p className="text-sm font-semibold text-navy-900">
                          Görseller hazır olduğunda buraya görsel yolları eklenecek.
                        </p>
                        <p className="mt-1 text-sm text-navy-900/65">
                          Şimdilik yükleme yerine görsel/video yollarını metin olarak ekleyebilirsiniz.
                        </p>
                        <p className="mt-1 text-xs text-navy-900/55">Görsel hazır değilse boş bırakabilirsiniz.</p>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <InputField label="Ana Görsel Yolu">
                            <input
                              value={vehicleForm.mainImage}
                              onChange={(event) => setVehicleMainImage(event.target.value)}
                              className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                              placeholder="/images/fleet/ornek-arac.jpg"
                            />
                          </InputField>

                          <InputField label="Yeni Görsel Yolu">
                            <div className="flex gap-2">
                              <input
                                value={vehicleMediaPathInput}
                                onChange={(event) => setVehicleMediaPathInput(event.target.value)}
                                className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                                placeholder="/images/fleet/ornek-arac-2.jpg"
                              />
                              <button
                                type="button"
                                onClick={addVehicleGalleryImage}
                                className="rounded-lg border border-navy-900/20 px-3 py-2 text-xs font-semibold text-navy-900"
                              >
                                Ekle
                              </button>
                            </div>
                          </InputField>
                        </div>

                        <div className="mt-4 rounded-xl border border-navy-900/10 bg-white p-3">
                          <p className="mb-2 text-xs uppercase tracking-[0.12em] text-navy-900/60">
                            Galeri Sırası
                          </p>
                          <div className="space-y-2">
                            {(vehicleForm.galleryImages || []).map((path, index) => (
                              <div
                                key={`${path}-${index}`}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy-900/10 p-2 text-xs"
                              >
                                <span className="max-w-[60%] truncate text-navy-900/75">{path}</span>
                                <div className="flex flex-wrap gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setVehicleMainImage(path)}
                                    className="rounded border border-gold-300 px-2 py-1 text-gold-700"
                                  >
                                    Ana Görsel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveVehicleGalleryImage(index, "up")}
                                    className="rounded border border-navy-900/20 px-2 py-1 text-navy-900"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveVehicleGalleryImage(index, "down")}
                                    className="rounded border border-navy-900/20 px-2 py-1 text-navy-900"
                                  >
                                    ↓
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeVehicleGalleryImage(path)}
                                    className="rounded border border-red-300 px-2 py-1 text-red-600"
                                  >
                                    Sil
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="rounded-xl border border-navy-900/15 bg-cloud-50 p-4 text-sm text-navy-900">
                          <span className="mb-3 block font-semibold">Carousel Durumu</span>
                          <select
                            value={vehicleForm.carouselActive ? "on" : "off"}
                            onChange={(event) =>
                              setVehicleForm((prev) => ({ ...prev, carouselActive: event.target.value === "on" }))
                            }
                            className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2"
                          >
                            <option value="on">Aktif</option>
                            <option value="off">Pasif</option>
                          </select>
                        </label>
                        <label className="rounded-xl border border-navy-900/15 bg-cloud-50 p-4 text-sm text-navy-900">
                          <span className="mb-3 block font-semibold">Carousel Hızı</span>
                          <select
                            value={vehicleForm.carouselSpeed || "normal"}
                            onChange={(event) =>
                              setVehicleForm((prev) => ({
                                ...prev,
                                carouselSpeed: event.target.value as CarouselSpeed
                              }))
                            }
                            className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2"
                          >
                            {carouselSpeedOptions.map((speed) => (
                              <option key={speed} value={speed}>
                                {carouselSpeedLabelTr(speed)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {vehicleWizardStep === 4 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="rounded-xl border border-navy-900/15 bg-cloud-50 p-4 text-sm text-navy-900">
                        <span className="mb-3 block font-semibold">Yayın Durumu</span>
                        <select
                          value={vehicleForm.active ? "active" : "passive"}
                          onChange={(event) =>
                            setVehicleForm((prev) => ({ ...prev, active: event.target.value === "active" }))
                          }
                          className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2"
                        >
                          <option value="active">Aktif</option>
                          <option value="passive">Pasif</option>
                        </select>
                      </label>
                      <label className="rounded-xl border border-navy-900/15 bg-cloud-50 p-4 text-sm text-navy-900">
                        <span className="mb-3 block font-semibold">Vitrin Durumu</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={vehicleForm.featured}
                            onChange={(event) =>
                              setVehicleForm((prev) => ({ ...prev, featured: event.target.checked }))
                            }
                          />
                          <span>Öne Çıkan</span>
                        </div>
                      </label>
                      <div className="md:col-span-2 rounded-xl border border-gold-400/35 bg-gold-50 px-4 py-3 text-sm text-gold-700">
                        Kaydet dediğinizde araç otomatik olarak sisteme eklenir ve gerekli teknik bilgiler arka planda hazırlanır.
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2">
                    {vehicleWizardStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setVehicleWizardStep((prev) => (prev - 1) as VehicleWizardStep)}
                        className="rounded-lg border border-navy-900/25 px-4 py-2 text-sm font-semibold text-navy-900"
                      >
                        Geri
                      </button>
                    ) : null}

                    {vehicleWizardStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => goToVehicleStep((vehicleWizardStep + 1) as VehicleWizardStep)}
                        className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
                      >
                        Devam Et
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="rounded-lg bg-navy-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
                      >
                        {vehicleEditId ? "Aracı Güncelle" : "Aracı Kaydet"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={resetVehicleForm}
                      className="rounded-lg border border-navy-900/20 px-4 py-2 text-sm font-semibold text-navy-900"
                    >
                      Temizle
                    </button>
                  </div>
                </form>
              </SectionCard>

              <SectionCard title="Araç Listesi" description="Araçları hızlıca arayın, filtreleyin ve yönetin.">
                <div className="grid gap-3 lg:grid-cols-4">
                  <input
                    value={vehicleSearch}
                    onChange={(event) => setVehicleSearch(event.target.value)}
                    placeholder="Araç ara"
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                  <select
                    value={vehicleCategoryFilter}
                    onChange={(event) => setVehicleCategoryFilter(event.target.value as "all" | VehicleCategory)}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  >
                    <option value="all">Tüm Kategoriler</option>
                    {vehicleCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {vehicleCategoryLabel(category, locale)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={vehicleFuelFilter}
                    onChange={(event) => setVehicleFuelFilter(event.target.value as "all" | FuelType)}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  >
                    <option value="all">Tüm Yakıt Tipleri</option>
                    {fuelOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <select
                    value={vehicleStatusFilter}
                    onChange={(event) => setVehicleStatusFilter(event.target.value as VehicleStatusFilter)}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="passive">Pasif</option>
                  </select>
                </div>

                <p className="mt-4 text-sm font-semibold text-navy-900">
                  Toplam {content.vehicles.length} araç
                  {filteredVehicles.length !== content.vehicles.length ? ` (Filtrelenen: ${filteredVehicles.length})` : ""}
                </p>

                {filteredVehicles.length ? (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-navy-900/10">
                    <table className="min-w-[1040px] text-left text-sm">
                      <thead className="bg-cloud-100/70 text-navy-900/70">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Araç</th>
                          <th className="px-4 py-3 font-semibold">Kategori</th>
                          <th className="px-4 py-3 font-semibold">Yakıt</th>
                          <th className="px-4 py-3 font-semibold">Aylık Fiyat</th>
                          <th className="px-4 py-3 font-semibold">Durum</th>
                          <th className="px-4 py-3 font-semibold">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVehicles.map((vehicle) => {
                          const lowestPriceCandidates = (vehicle.rentalPackages || [])
                            .flatMap((pkg) => [pkg.prices[1000], pkg.prices[2000], pkg.prices[3000]])
                            .filter((price): price is number => typeof price === "number" && price > 0);
                          const lowestPrice = lowestPriceCandidates.length ? Math.min(...lowestPriceCandidates) : 0;
                          const fuelText =
                            Array.from(new Set((vehicle.rentalPackages || []).map((item) => item.fuelType))).join(", ") || "-";
                          const vehicleWithoutId = toVehicleForm(vehicle);
                          return (
                            <tr key={vehicle.id} className="border-t border-navy-900/10 align-top">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-12 w-20 overflow-hidden rounded-lg border border-navy-900/10 bg-cloud-100">
                                    <Image
                                      src={vehicle.mainImage || VEHICLE_PLACEHOLDER_IMAGE}
                                      alt={`${vehicle.brand} ${vehicle.model}`}
                                      fill
                                      sizes="80px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-navy-900">
                                      {vehicle.brand} {vehicle.model}
                                    </p>
                                    <p className="text-xs text-navy-900/60">
                                      Paket: {(vehicle.rentalPackages || []).length} adet
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-xs text-navy-900/80">
                                <p>{vehicleCategoryLabel(vehicle.primaryCategory, locale)}</p>
                                {vehicle.secondaryCategories.length ? (
                                  <p className="mt-1 text-navy-900/60">
                                    {vehicle.secondaryCategories
                                      .map((item) => vehicleCategoryLabel(item, locale))
                                      .join(", ")}
                                  </p>
                                ) : null}
                              </td>
                              <td className="px-4 py-4 text-navy-900/80">{fuelText}</td>
                              <td className="px-4 py-4 font-semibold text-navy-900">{currencyTl(lowestPrice, locale)}</td>
                              <td className="px-4 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    vehicle.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {vehicle.active ? "Aktif" : "Pasif"}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className="rounded-md border border-navy-900/20 px-3 py-1.5 text-xs font-semibold text-navy-900"
                                    onClick={() => {
                                      setVehicleEditId(vehicle.id);
                                      setVehicleForm({
                                        ...vehicleWithoutId,
                                        mainImage: vehicle.mainImage || VEHICLE_PLACEHOLDER_IMAGE,
                                        galleryImages: Array.from(
                                          new Set(
                                            [vehicle.mainImage || VEHICLE_PLACEHOLDER_IMAGE, ...(vehicle.galleryImages || [])].filter(
                                              Boolean
                                            )
                                          )
                                        ),
                                        carouselActive:
                                          vehicle.carouselActive ?? (vehicle.galleryImages || []).length > 1,
                                        carouselSpeed: vehicle.carouselSpeed ?? "normal"
                                      });
                                      setVehicleMediaPathInput("");
                                      setVehiclePackageIndex(0);
                                      setVehicleWizardStep(1);
                                    }}
                                  >
                                    Düzenle
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-md border border-gold-500/40 px-3 py-1.5 text-xs font-semibold text-gold-700"
                                    onClick={() => {
                                      if (
                                        !window.confirm(
                                          "Bu aracı kopyalayıp yeni araç olarak düzenlemek istiyor musunuz?"
                                        )
                                      ) {
                                        return;
                                      }
                                      setVehicleEditId(null);
                                      setVehicleForm({
                                        ...vehicleWithoutId,
                                        model: `${vehicle.model} Kopya`,
                                        slug: "",
                                        featured: false,
                                        mainImage: vehicle.mainImage || VEHICLE_PLACEHOLDER_IMAGE,
                                        galleryImages: Array.from(
                                          new Set(
                                            [vehicle.mainImage || VEHICLE_PLACEHOLDER_IMAGE, ...(vehicle.galleryImages || [])].filter(
                                              Boolean
                                            )
                                          )
                                        ),
                                        carouselActive: vehicle.carouselActive ?? true,
                                        carouselSpeed: vehicle.carouselSpeed ?? "normal",
                                        rentalPackages: (vehicle.rentalPackages || []).map((pkg) => ({
                                          ...pkg,
                                          id: `pkg-${Math.random().toString(36).slice(2, 9)}`
                                        })),
                                        variants: []
                                      });
                                      setVehicleMediaPathInput("");
                                      setVehiclePackageIndex(0);
                                      setVehicleWizardStep(1);
                                      flashSaved("Araç kopyası oluşturuldu. Düzenleyip kaydedebilirsiniz.");
                                    }}
                                  >
                                    Kopyala
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700"
                                    onClick={() => updateVehicle(vehicle.id, { active: !vehicle.active })}
                                  >
                                    {vehicle.active ? "Pasif Yap" : "Aktif Yap"}
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600"
                                    onClick={() => {
                                      if (!window.confirm("Bu aracı silmek istiyor musunuz?")) return;
                                      deleteVehicle(vehicle.id);
                                    }}
                                  >
                                    Sil
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-navy-900/20 bg-cloud-50 p-6 text-sm text-navy-900/65">
                    Bu filtrelere uygun araç bulunamadı.
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Gelişmiş İşlemler">
                <button
                  type="button"
                  onClick={() => setShowAdvancedVehicleTools((prev) => !prev)}
                  className="rounded-lg border border-navy-900/20 px-4 py-2 text-sm font-semibold text-navy-900"
                >
                  {showAdvancedVehicleTools ? "Gelişmiş Bölümü Gizle" : "Gelişmiş Bölümü Aç"}
                </button>
                {showAdvancedVehicleTools ? (
                  <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-800">Toplu araç ekleme için kullanılır. Emin değilseniz kullanmayın.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg border border-amber-400/50 bg-white px-4 py-2 text-xs font-semibold text-amber-700/70"
                      >
                        CSV İçe Aktar (Yakında)
                      </button>
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg border border-amber-400/50 bg-white px-4 py-2 text-xs font-semibold text-amber-700/70"
                      >
                        CSV Dışa Aktar (Yakında)
                      </button>
                    </div>
                  </div>
                ) : null}
              </SectionCard>
            </div>
          ) : null}
          {tab === "projects" ? (
            <div className="space-y-6">
              <SectionCard title="Proje Yönetimi">
                <form onSubmit={onProjectSubmit} className="grid gap-4 md:grid-cols-2">
                  <InputField label="Başlık (TR)">
                    <input
                      value={projectForm.titleTr}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, titleTr: event.target.value }))}
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    />
                  </InputField>
                  <InputField label="Başlık (EN)">
                    <input
                      value={projectForm.titleEn}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, titleEn: event.target.value }))}
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    />
                  </InputField>
                  <InputField label="Özet (TR)">
                    <textarea
                      rows={2}
                      value={projectForm.summaryTr}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, summaryTr: event.target.value }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    />
                  </InputField>
                  <InputField label="Özet (EN)">
                    <textarea
                      rows={2}
                      value={projectForm.summaryEn}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, summaryEn: event.target.value }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    />
                  </InputField>
                  <InputField label="Açıklama (TR)">
                    <textarea
                      rows={2}
                      value={projectForm.descriptionTr}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, descriptionTr: event.target.value }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    />
                  </InputField>
                  <InputField label="Açıklama (EN)">
                    <textarea
                      rows={2}
                      value={projectForm.descriptionEn}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, descriptionEn: event.target.value }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    />
                  </InputField>
                  <InputField label="Konum (TR)">
                    <input
                      value={projectForm.locationTr}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, locationTr: event.target.value }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    />
                  </InputField>
                  <InputField label="Location (EN)">
                    <input
                      value={projectForm.locationEn}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, locationEn: event.target.value }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    />
                  </InputField>
                  <InputField label="Kategori">
                    <select
                      value={projectForm.category}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, category: event.target.value as ProjectCategory }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    >
                      {projectCategoryOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </InputField>
                  <InputField label="Durum">
                    <select
                      value={projectForm.status}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, status: event.target.value as ProjectStatus }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    >
                      {projectStatusOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </InputField>
                  <InputField label="Ana Görsel Yolu">
                    <input
                      value={projectForm.featuredImage || ""}
                      onChange={(event) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          featuredImage: event.target.value,
                          imageUrl: event.target.value
                        }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                      placeholder="/images/construction/projects/KNT-001/photos/1.jpg"
                    />
                  </InputField>
                  <InputField label="Video Yolu">
                    <input
                      value={projectForm.videoUrl}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                      placeholder="/images/construction/projects/KNT-001/videos/1.mp4"
                    />
                  </InputField>
                  <InputField label="Tarih (YYYY-MM)">
                    <input
                      value={projectForm.date}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, date: event.target.value }))}
                      className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                    />
                  </InputField>
                  <label className="rounded-xl border border-navy-900/15 bg-cloud-50 p-4 text-sm text-navy-900">
                    <span className="mb-3 block font-semibold">Carousel Durumu</span>
                    <select
                      value={projectForm.carouselActive ? "on" : "off"}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, carouselActive: event.target.value === "on" }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2"
                    >
                      <option value="on">Aktif</option>
                      <option value="off">Pasif</option>
                    </select>
                  </label>
                  <label className="rounded-xl border border-navy-900/15 bg-cloud-50 p-4 text-sm text-navy-900">
                    <span className="mb-3 block font-semibold">Carousel Hızı</span>
                    <select
                      value={projectForm.carouselSpeed || "normal"}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, carouselSpeed: event.target.value as CarouselSpeed }))
                      }
                      className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2"
                    >
                      {carouselSpeedOptions.map((speed) => (
                        <option key={speed} value={speed}>
                          {carouselSpeedLabelTr(speed)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <input
                      type="checkbox"
                      checked={projectForm.featured}
                      onChange={(event) =>
                        setProjectForm((prev) => ({ ...prev, featured: event.target.checked }))
                      }
                    />
                    Öne Çıkan
                  </label>

                  <div className="space-y-3 rounded-xl border border-navy-900/10 bg-cloud-50 p-4 md:col-span-2">
                    <p className="text-sm font-semibold text-navy-900">
                      Görseller hazır olduğunda buraya görsel yolları eklenecek.
                    </p>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <input
                        value={projectMediaPathInput}
                        onChange={(event) => setProjectMediaPathInput(event.target.value)}
                        className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                        placeholder="/images/construction/projects/KNT-001/photos/1.jpg"
                      />
                      <button
                        type="button"
                        onClick={addProjectGalleryImage}
                        className="rounded-lg border border-navy-900/20 px-4 py-2 text-xs font-semibold text-navy-900"
                      >
                        Görsel Ekle
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(projectForm.galleryImages || []).map((path, index) => (
                        <div
                          key={`${path}-${index}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy-900/10 bg-white p-2 text-xs"
                        >
                          <span className="max-w-[60%] truncate text-navy-900/75">{path}</span>
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => setProjectFeaturedImage(path)}
                              className="rounded border border-gold-300 px-2 py-1 text-gold-700"
                            >
                              Ana Görsel
                            </button>
                            <button
                              type="button"
                              onClick={() => moveProjectGalleryImage(index, "up")}
                              className="rounded border border-navy-900/20 px-2 py-1 text-navy-900"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveProjectGalleryImage(index, "down")}
                              className="rounded border border-navy-900/20 px-2 py-1 text-navy-900"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProjectGalleryImage(path)}
                              className="rounded border border-red-300 px-2 py-1 text-red-600"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative h-40 overflow-hidden rounded-xl border border-navy-900/10 bg-cloud-50 md:col-span-2">
                    <Image
                      src={
                        projectForm.featuredImage ||
                        projectForm.imageUrl ||
                        "/images/construction/project-placeholder-1.svg"
                      }
                      alt="Project preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 900px"
                      className="object-cover"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white"
                    >
                      {projectEditId ? "Projeyi Güncelle" : "Proje Ekle"}
                    </button>
                  </div>
                </form>
              </SectionCard>

              <SectionCard title="Proje Listesi">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-navy-900/10 text-navy-900/65">
                        <th className="p-3">Proje</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Durum</th>
                        <th className="p-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.projects.map((project) => (
                        <tr key={project.id} className="border-b border-navy-900/10">
                          <td className="p-3">
                            <p className="font-medium text-navy-900">{project.titleTr}</p>
                            <p className="text-xs text-navy-900/60">{project.locationTr}</p>
                          </td>
                          <td className="p-3 text-xs">{project.category}</td>
                          <td className="p-3 text-xs">{project.status}</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="rounded-md border border-navy-900/20 px-2 py-1 text-xs"
                                onClick={() => {
                                  setProjectEditId(project.id);
                                  setProjectForm({
                                    ...project,
                                    featuredImage: project.featuredImage || project.imageUrl,
                                    galleryImages: Array.from(
                                      new Set(
                                        [project.featuredImage || project.imageUrl, ...(project.galleryImages || [])].filter(
                                          Boolean
                                        )
                                      )
                                    ),
                                    carouselActive: project.carouselActive ?? (project.galleryImages || []).length > 1,
                                    carouselSpeed: project.carouselSpeed ?? "normal"
                                  });
                                  setProjectMediaPathInput("");
                                }}
                              >
                                Düzenle
                              </button>
                              <button
                                type="button"
                                className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600"
                                onClick={() => {
                                  if (!window.confirm("Bu projeyi silmek istiyor musunuz?")) return;
                                  deleteProject(project.id);
                                }}
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          ) : null}

          {tab === "homepage-content" ? (
            <SectionCard title="Ana Sayfa İçeriği">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateHome(homeForm);
                  updateAbout(aboutForm);
                  flashSaved("Homepage içerikleri kaydedildi.");
                }}
                className="grid gap-4 md:grid-cols-2"
              >
                <InputField label="Hero Başlık (TR)">
                  <input
                    value={homeForm.headlineTr}
                    onChange={(event) => setHomeForm((prev) => ({ ...prev, headlineTr: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Hero Başlık (EN)">
                  <input
                    value={homeForm.headlineEn}
                    onChange={(event) => setHomeForm((prev) => ({ ...prev, headlineEn: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Hero Alt Başlık (TR)">
                  <textarea
                    rows={2}
                    value={homeForm.subHeadlineTr}
                    onChange={(event) => setHomeForm((prev) => ({ ...prev, subHeadlineTr: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Hero Alt Başlık (EN)">
                  <textarea
                    rows={2}
                    value={homeForm.subHeadlineEn}
                    onChange={(event) => setHomeForm((prev) => ({ ...prev, subHeadlineEn: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="CTA (TR)">
                  <input
                    value={homeForm.ctaTr}
                    onChange={(event) => setHomeForm((prev) => ({ ...prev, ctaTr: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="CTA (EN)">
                  <input
                    value={homeForm.ctaEn}
                    onChange={(event) => setHomeForm((prev) => ({ ...prev, ctaEn: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Service Başlık (TR)">
                  <input
                    value={homeForm.serviceTitleTr}
                    onChange={(event) => setHomeForm((prev) => ({ ...prev, serviceTitleTr: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Service Başlık (EN)">
                  <input
                    value={homeForm.serviceTitleEn}
                    onChange={(event) => setHomeForm((prev) => ({ ...prev, serviceTitleEn: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Service Açıklama (TR)">
                  <textarea
                    rows={2}
                    value={homeForm.serviceDescriptionTr}
                    onChange={(event) =>
                      setHomeForm((prev) => ({ ...prev, serviceDescriptionTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Service Açıklama (EN)">
                  <textarea
                    rows={2}
                    value={homeForm.serviceDescriptionEn}
                    onChange={(event) =>
                      setHomeForm((prev) => ({ ...prev, serviceDescriptionEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="About Başlık (TR)">
                  <input
                    value={aboutForm.titleTr}
                    onChange={(event) => setAboutForm((prev) => ({ ...prev, titleTr: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="About Başlık (EN)">
                  <input
                    value={aboutForm.titleEn}
                    onChange={(event) => setAboutForm((prev) => ({ ...prev, titleEn: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="About Açıklama (TR)">
                  <textarea
                    rows={2}
                    value={aboutForm.descriptionTr}
                    onChange={(event) =>
                      setAboutForm((prev) => ({ ...prev, descriptionTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="About Açıklama (EN)">
                  <textarea
                    rows={2}
                    value={aboutForm.descriptionEn}
                    onChange={(event) =>
                      setAboutForm((prev) => ({ ...prev, descriptionEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <div className="md:col-span-2">
                  <button type="submit" className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white">
                    Kaydet
                  </button>
                </div>
              </form>
            </SectionCard>
          ) : null}

          {tab === "construction-content" ? (
            <SectionCard title="İnşaat İçerikleri">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateConstruction(constructionForm);
                  flashSaved("Construction içerikleri kaydedildi.");
                }}
                className="grid gap-4 md:grid-cols-2"
              >
                <InputField label="Başlık (TR)">
                  <input
                    value={constructionForm.titleTr}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, titleTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Başlık (EN)">
                  <input
                    value={constructionForm.titleEn}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, titleEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Açıklama (TR)">
                  <textarea
                    rows={2}
                    value={constructionForm.descriptionTr}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, descriptionTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Açıklama (EN)">
                  <textarea
                    rows={2}
                    value={constructionForm.descriptionEn}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, descriptionEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Residential (TR)">
                  <textarea
                    rows={2}
                    value={constructionForm.residentialTr}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, residentialTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Residential (EN)">
                  <textarea
                    rows={2}
                    value={constructionForm.residentialEn}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, residentialEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Commercial (TR)">
                  <textarea
                    rows={2}
                    value={constructionForm.commercialTr}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, commercialTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Commercial (EN)">
                  <textarea
                    rows={2}
                    value={constructionForm.commercialEn}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, commercialEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Renovation (TR)">
                  <textarea
                    rows={2}
                    value={constructionForm.renovationTr}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, renovationTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Renovation (EN)">
                  <textarea
                    rows={2}
                    value={constructionForm.renovationEn}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, renovationEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Turnkey (TR)">
                  <textarea
                    rows={2}
                    value={constructionForm.turnkeyTr}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, turnkeyTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Turnkey (EN)">
                  <textarea
                    rows={2}
                    value={constructionForm.turnkeyEn}
                    onChange={(event) =>
                      setConstructionForm((prev) => ({ ...prev, turnkeyEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <div className="md:col-span-2">
                  <button type="submit" className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white">
                    Kaydet
                  </button>
                </div>
              </form>
            </SectionCard>
          ) : null}

          {tab === "architecture-content" ? (
            <SectionCard title="Mimarlık İçerikleri">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateArchitecture(architectureForm);
                  flashSaved("Architecture içerikleri kaydedildi.");
                }}
                className="grid gap-4 md:grid-cols-2"
              >
                <InputField label="Başlık (TR)">
                  <input
                    value={architectureForm.titleTr}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, titleTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Başlık (EN)">
                  <input
                    value={architectureForm.titleEn}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, titleEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Açıklama (TR)">
                  <textarea
                    rows={2}
                    value={architectureForm.descriptionTr}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, descriptionTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Açıklama (EN)">
                  <textarea
                    rows={2}
                    value={architectureForm.descriptionEn}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, descriptionEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Interior (TR)">
                  <textarea
                    rows={2}
                    value={architectureForm.interiorTr}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, interiorTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Interior (EN)">
                  <textarea
                    rows={2}
                    value={architectureForm.interiorEn}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, interiorEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Exterior (TR)">
                  <textarea
                    rows={2}
                    value={architectureForm.exteriorTr}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, exteriorTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Exterior (EN)">
                  <textarea
                    rows={2}
                    value={architectureForm.exteriorEn}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, exteriorEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Drawing (TR)">
                  <textarea
                    rows={2}
                    value={architectureForm.drawingTr}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, drawingTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Drawing (EN)">
                  <textarea
                    rows={2}
                    value={architectureForm.drawingEn}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, drawingEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Concept (TR)">
                  <textarea
                    rows={2}
                    value={architectureForm.conceptTr}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, conceptTr: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Concept (EN)">
                  <textarea
                    rows={2}
                    value={architectureForm.conceptEn}
                    onChange={(event) =>
                      setArchitectureForm((prev) => ({ ...prev, conceptEn: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <div className="md:col-span-2">
                  <button type="submit" className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white">
                    Kaydet
                  </button>
                </div>
              </form>
            </SectionCard>
          ) : null}

          {tab === "contact-settings" ? (
            <SectionCard title="İletişim Ayarları">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateContact(contactForm);
                  flashSaved("İletişim ayarları kaydedildi.");
                }}
                className="grid gap-4 md:grid-cols-2"
              >
                <InputField label="Telefon">
                  <input
                    value={contactForm.phone}
                    onChange={(event) => setContactForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="WhatsApp (90XXXXXXXXXX)">
                  <input
                    value={contactForm.whatsapp}
                    onChange={(event) => setContactForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="E-posta">
                  <input
                    value={contactForm.email}
                    onChange={(event) => setContactForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Adres (TR)">
                  <input
                    value={contactForm.addressTr}
                    onChange={(event) => setContactForm((prev) => ({ ...prev, addressTr: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Adres (EN)">
                  <input
                    value={contactForm.addressEn}
                    onChange={(event) => setContactForm((prev) => ({ ...prev, addressEn: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Harita Bağlantısı">
                  <input
                    value={contactForm.mapEmbedUrl}
                    onChange={(event) => setContactForm((prev) => ({ ...prev, mapEmbedUrl: event.target.value }))}
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Instagram">
                  <input
                    value={contactForm.social.instagram}
                    onChange={(event) =>
                      setContactForm((prev) => ({
                        ...prev,
                        social: { ...prev.social, instagram: event.target.value }
                      }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <div className="md:col-span-2">
                  <button type="submit" className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white">
                    Kaydet
                  </button>
                </div>
              </form>
            </SectionCard>
          ) : null}

          {tab === "media-library" ? (
            <SectionCard title="Medya Kütüphanesi">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateMediaLibrary(
                    mediaText
                      .split("\n")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  );
                  flashSaved("Media listesi kaydedildi.");
                }}
                className="space-y-4"
              >
                <textarea
                  rows={10}
                  value={mediaText}
                  onChange={(event) => setMediaText(event.target.value)}
                  className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                />
                <button type="submit" className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white">
                  Kaydet
                </button>
              </form>
            </SectionCard>
          ) : null}

          {tab === "requests" ? (
            <SectionCard
              title="Teklif Talepleri"
              description="Form ve WhatsApp üzerinden gelen tüm teklif taleplerini buradan takip edebilirsiniz."
            >
              {quoteRequests.length ? (
                <div className="overflow-x-auto rounded-xl border border-navy-900/10">
                  <table className="min-w-[1180px] text-left text-sm">
                    <thead className="bg-cloud-100/70 text-navy-900/70">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Tarih</th>
                        <th className="px-4 py-3 font-semibold">Ad Soyad</th>
                        <th className="px-4 py-3 font-semibold">Telefon</th>
                        <th className="px-4 py-3 font-semibold">E-posta</th>
                        <th className="px-4 py-3 font-semibold">Hizmet Türü</th>
                        <th className="px-4 py-3 font-semibold">Araç / Proje / Hizmet</th>
                        <th className="px-4 py-3 font-semibold">Mesaj</th>
                        <th className="px-4 py-3 font-semibold">Durum</th>
                        <th className="px-4 py-3 font-semibold">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteRequests.map((request) => (
                        <tr key={request.id} className="border-t border-navy-900/10 align-top">
                          <td className="px-4 py-4 text-xs text-navy-900/65">
                            {new Date(request.createdAt).toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
                          </td>
                          <td className="px-4 py-4 font-medium text-navy-900">{request.name}</td>
                          <td className="px-4 py-4 text-navy-900/80">{request.phone}</td>
                          <td className="px-4 py-4 text-navy-900/80">{request.email}</td>
                          <td className="px-4 py-4 text-navy-900/80">{serviceTypeLabel(request.serviceType, locale)}</td>
                          <td className="px-4 py-4 text-navy-900/80">{requestSubject(request, locale)}</td>
                          <td className="max-w-[280px] px-4 py-4 text-navy-900/70">
                            {request.message || "-"}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={request.status} locale={locale} />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedRequest(request)}
                                className="rounded-md border border-navy-900/20 px-3 py-1.5 text-xs font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
                              >
                                Detay
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuoteRequestStatus(request.id, nextRequestStatus(request.status))
                                }
                                className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
                              >
                                Durum Değiştir
                              </button>
                              <button
                                type="button"
                                className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                onClick={() => {
                                  if (!window.confirm("Talebi silmek istiyor musunuz?")) return;
                                  deleteQuoteRequest(request.id);
                                }}
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-navy-900/20 bg-cloud-50 p-8 text-center text-sm text-navy-900/65">
                  Henüz teklif talebi yok.
                </div>
              )}
            </SectionCard>
          ) : null}

          {selectedRequest ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/60 p-4">
              <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-gold-600">Teklif Detayı</p>
                    <h3 className="mt-2 font-display text-2xl text-navy-900">{selectedRequest.name}</h3>
                    <p className="mt-1 text-sm text-navy-900/65">
                      {new Date(selectedRequest.createdAt).toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="rounded-md border border-navy-900/20 px-3 py-1 text-sm text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
                  >
                    Kapat
                  </button>
                </div>

                <div className="grid gap-4 text-sm text-navy-900/80 md:grid-cols-2">
                  <p>
                    <strong>Telefon:</strong> {selectedRequest.phone}
                  </p>
                  <p>
                    <strong>E-posta:</strong> {selectedRequest.email}
                  </p>
                  <p>
                    <strong>Hizmet Türü:</strong> {serviceTypeLabel(selectedRequest.serviceType, locale)}
                  </p>
                  <p>
                    <strong>Durum:</strong> {requestStatusLabel(selectedRequest.status, locale)}
                  </p>
                  <p className="md:col-span-2">
                    <strong>Araç / Proje / Hizmet:</strong> {requestSubject(selectedRequest, locale)}
                  </p>
                  <p className="md:col-span-2 whitespace-pre-wrap rounded-xl border border-navy-900/10 bg-cloud-50 p-3">
                    {selectedRequest.message || "-"}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {requestStatusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        updateQuoteRequestStatus(selectedRequest.id, status);
                        setSelectedRequest((prev) => (prev ? { ...prev, status } : prev));
                      }}
                      className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                        selectedRequest.status === status
                          ? "border-gold-500 bg-gold-50 text-gold-700"
                          : "border-navy-900/20 text-navy-900 hover:border-gold-500 hover:text-gold-600"
                      }`}
                    >
                      {requestStatusLabel(status, locale)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {tab === "settings" ? (
            <SectionCard title="Ayarlar">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateSettings(settingsForm);
                  flashSaved("Ayarlar kaydedildi.");
                }}
                className="grid gap-4 md:grid-cols-2"
              >
                <label className="flex items-center gap-2 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    checked={settingsForm.maintenanceMode}
                    onChange={(event) =>
                      setSettingsForm((prev) => ({ ...prev, maintenanceMode: event.target.checked }))
                    }
                  />
                  Bakım Modu
                </label>
                <InputField label="İletişim E-postası">
                  <input
                    value={settingsForm.contactEmail}
                    onChange={(event) =>
                      setSettingsForm((prev) => ({ ...prev, contactEmail: event.target.value }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  />
                </InputField>
                <InputField label="Para Birimi">
                  <select
                    value={settingsForm.currency}
                    onChange={(event) =>
                      setSettingsForm((prev) => ({ ...prev, currency: event.target.value as "TRY" }))
                    }
                    className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
                  >
                    <option value="TRY">TRY</option>
                  </select>
                </InputField>
                <div className="md:col-span-2">
                  <button type="submit" className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white">
                    Kaydet
                  </button>
                </div>
              </form>
            </SectionCard>
          ) : null}
        </section>
      </div>
    </main>
  );
}

