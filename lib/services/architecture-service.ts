import {
  defaultArchitectureCategories,
  defaultArchitectureProjects
} from "@/lib/data/default-architecture-content";
import { architectureFolderProjectManifest } from "@/lib/data/architecture-folder-manifest";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArchitectureCategory, ArchitectureProject } from "@/lib/types";

interface ArchitectureCategoryRow {
  id: string;
  title_tr: string | null;
  title_en: string | null;
  slug: string | null;
  description_tr: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  active: boolean | null;
  sort_order: number | null;
  created_at?: string;
  updated_at?: string;
}

interface ArchitectureProjectRow {
  id: string;
  category_id: string | null;
  title_tr: string | null;
  title_en: string | null;
  slug: string | null;
  short_description_tr: string | null;
  short_description_en: string | null;
  detailed_description_tr: string | null;
  detailed_description_en: string | null;
  subtitle_tr: string | null;
  subtitle_en: string | null;
  cover_image_url: string | null;
  gallery_image_urls: unknown;
  location_tr: string | null;
  location_en: string | null;
  status_tr: string | null;
  status_en: string | null;
  year: string | null;
  active: boolean | null;
  featured: boolean | null;
  sort_order: number | null;
  created_at?: string;
  updated_at?: string;
}

interface ArchitecturePortfolioData {
  categories: ArchitectureCategory[];
  projects: ArchitectureProject[];
  warning?: string;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 96);
}

function uniqueStringList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    )
  );
}

function safeReadJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeCategory(input: Partial<ArchitectureCategory>, index: number): ArchitectureCategory {
  const titleTr = input.titleTr?.trim() || `Kategori ${index + 1}`;
  const slug = input.slug?.trim() || toSlug(titleTr) || `kategori-${index + 1}`;
  return {
    id: input.id?.trim() || `arc-cat-${index + 1}`,
    titleTr,
    titleEn: input.titleEn?.trim() || titleTr,
    slug,
    descriptionTr: input.descriptionTr?.trim() || "",
    descriptionEn: input.descriptionEn?.trim() || "",
    coverImageUrl: input.coverImageUrl?.trim() || "/images/architecture/project-placeholder-1.svg",
    active: input.active !== false,
    sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : index + 1
  };
}

function normalizeProject(input: Partial<ArchitectureProject>, index: number): ArchitectureProject {
  const titleTr = input.titleTr?.trim() || `Proje ${index + 1}`;
  const slug = input.slug?.trim() || toSlug(titleTr) || `proje-${index + 1}`;
  const categoryId = input.categoryId?.trim() || defaultArchitectureCategories[0].id;
  return {
    id: input.id?.trim() || `arc-prj-${index + 1}`,
    categoryId,
    titleTr,
    titleEn: input.titleEn?.trim() || titleTr,
    slug,
    shortDescriptionTr: input.shortDescriptionTr?.trim() || "",
    shortDescriptionEn: input.shortDescriptionEn?.trim() || "",
    detailedDescriptionTr: input.detailedDescriptionTr?.trim() || "",
    detailedDescriptionEn: input.detailedDescriptionEn?.trim() || "",
    subtitleTr: input.subtitleTr?.trim() || "",
    subtitleEn: input.subtitleEn?.trim() || "",
    coverImageUrl: input.coverImageUrl?.trim() || "/images/architecture/project-placeholder-1.svg",
    galleryImageUrls: uniqueStringList(input.galleryImageUrls),
    locationTr: input.locationTr?.trim() || "",
    locationEn: input.locationEn?.trim() || "",
    statusTr: input.statusTr?.trim() || "",
    statusEn: input.statusEn?.trim() || "",
    year: input.year?.trim() || "",
    active: input.active !== false,
    featured: Boolean(input.featured),
    sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : index + 1
  };
}

function sortCategories(items: ArchitectureCategory[]): ArchitectureCategory[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.titleTr.localeCompare(b.titleTr, "tr"));
}

function sortProjects(items: ArchitectureProject[]): ArchitectureProject[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.titleTr.localeCompare(b.titleTr, "tr"));
}

function resolveDefaultCategoryIdBySlug(slug: string): string {
  return defaultArchitectureCategories.find((item) => item.slug === slug)?.id || defaultArchitectureCategories[0].id;
}

function mapDefaultProjectsToCategories(categories: ArchitectureCategory[]): ArchitectureProject[] {
  const categoryIdBySlug = new Map(categories.map((item) => [item.slug, item.id]));
  return defaultArchitectureProjects.map((project, index) => {
    const defaultCategorySlug = defaultArchitectureCategories.find((item) => item.id === project.categoryId)?.slug;
    return normalizeProject(
      {
        ...project,
        categoryId: (defaultCategorySlug && categoryIdBySlug.get(defaultCategorySlug)) || project.categoryId
      },
      index
    );
  });
}

function buildSeedFromFolderManifest(baseCategories?: ArchitectureCategory[]): ArchitecturePortfolioData {
  const manifest = architectureFolderProjectManifest || [];
  const normalizedBaseCategories = sortCategories(
    (baseCategories && baseCategories.length ? baseCategories : defaultArchitectureCategories).map((item, index) =>
      normalizeCategory(item, index)
    )
  );

  const categoryIdBySlug = new Map(normalizedBaseCategories.map((item) => [item.slug, item.id]));

  if (!manifest.length) {
    return {
      categories: normalizedBaseCategories,
      projects: sortProjects(mapDefaultProjectsToCategories(normalizedBaseCategories))
    };
  }

  const categories = normalizedBaseCategories.map((category) => {
    const firstProject = manifest.find((item) => item.categorySlug === category.slug);
    return {
      ...category,
      coverImageUrl: firstProject?.coverImageUrl || category.coverImageUrl
    };
  });

  const projects: ArchitectureProject[] = manifest.map((item, index) =>
    normalizeProject(
      {
        id: item.id,
        categoryId: categoryIdBySlug.get(item.categorySlug) || resolveDefaultCategoryIdBySlug(item.categorySlug),
        titleTr: item.titleTr,
        titleEn: item.titleEn,
        slug: toSlug(item.titleTr),
        shortDescriptionTr: `${item.titleTr} icin mimari proje gorselleri.`,
        shortDescriptionEn: `Architectural visuals for ${item.titleEn}.`,
        detailedDescriptionTr: `${item.titleTr} projesine ait gorseller ve tasarim detaylari bu alanda incelenebilir.`,
        detailedDescriptionEn: `Visual assets and design details for ${item.titleEn} can be reviewed here.`,
        subtitleTr: "Mimari Portfoy",
        subtitleEn: "Architecture Portfolio",
        coverImageUrl: item.coverImageUrl,
        galleryImageUrls: item.galleryImageUrls,
        locationTr: "",
        locationEn: "",
        statusTr: "",
        statusEn: "",
        year: "",
        active: true,
        featured: index < 6,
        sortOrder: item.sortOrder
      },
      index
    )
  );

  return { categories: sortCategories(categories), projects: sortProjects(projects) };
}

function readFallbackCategories(): ArchitectureCategory[] {
  const local = safeReadJson<ArchitectureCategory[]>(STORAGE_KEYS.architectureCategories, []);
  if (!local.length) return buildSeedFromFolderManifest().categories;
  return local.map((item, index) => normalizeCategory(item, index));
}

function readFallbackProjects(): ArchitectureProject[] {
  const local = safeReadJson<ArchitectureProject[]>(STORAGE_KEYS.architectureProjects, []);
  if (!local.length) return buildSeedFromFolderManifest(readFallbackCategories()).projects;
  return local.map((item, index) => normalizeProject(item, index));
}

function writeFallbackData(data: ArchitecturePortfolioData): void {
  safeWriteJson(STORAGE_KEYS.architectureCategories, data.categories);
  safeWriteJson(STORAGE_KEYS.architectureProjects, data.projects);
}

function mapCategoryRow(row: ArchitectureCategoryRow, index: number): ArchitectureCategory {
  return normalizeCategory(
    {
      id: row.id,
      titleTr: row.title_tr || "",
      titleEn: row.title_en || "",
      slug: row.slug || "",
      descriptionTr: row.description_tr || "",
      descriptionEn: row.description_en || "",
      coverImageUrl: row.cover_image_url || "",
      active: row.active !== false,
      sortOrder: row.sort_order ?? index + 1
    },
    index
  );
}

function mapProjectRow(row: ArchitectureProjectRow, index: number): ArchitectureProject {
  return normalizeProject(
    {
      id: row.id,
      categoryId: row.category_id || "",
      titleTr: row.title_tr || "",
      titleEn: row.title_en || "",
      slug: row.slug || "",
      shortDescriptionTr: row.short_description_tr || "",
      shortDescriptionEn: row.short_description_en || "",
      detailedDescriptionTr: row.detailed_description_tr || "",
      detailedDescriptionEn: row.detailed_description_en || "",
      subtitleTr: row.subtitle_tr || "",
      subtitleEn: row.subtitle_en || "",
      coverImageUrl: row.cover_image_url || "",
      galleryImageUrls: uniqueStringList(row.gallery_image_urls),
      locationTr: row.location_tr || "",
      locationEn: row.location_en || "",
      statusTr: row.status_tr || "",
      statusEn: row.status_en || "",
      year: row.year || "",
      active: row.active !== false,
      featured: Boolean(row.featured),
      sortOrder: row.sort_order ?? index + 1
    },
    index
  );
}

function mapCategoryToRow(category: Omit<ArchitectureCategory, "id"> | ArchitectureCategory) {
  const maybeId = "id" in category ? category.id : undefined;
  return {
    ...(maybeId ? { id: maybeId } : {}),
    title_tr: category.titleTr.trim(),
    title_en: category.titleEn.trim() || category.titleTr.trim(),
    slug: toSlug(category.slug?.trim() || category.titleTr.trim()),
    description_tr: category.descriptionTr.trim(),
    description_en: category.descriptionEn.trim(),
    cover_image_url: category.coverImageUrl.trim(),
    active: category.active !== false,
    sort_order: Number(category.sortOrder) || 0
  };
}

function mapProjectToRow(project: Omit<ArchitectureProject, "id"> | ArchitectureProject) {
  const maybeId = "id" in project ? project.id : undefined;
  return {
    ...(maybeId ? { id: maybeId } : {}),
    category_id: project.categoryId,
    title_tr: project.titleTr.trim(),
    title_en: project.titleEn.trim() || project.titleTr.trim(),
    slug: toSlug(project.slug?.trim() || project.titleTr.trim()),
    short_description_tr: project.shortDescriptionTr.trim(),
    short_description_en: project.shortDescriptionEn.trim(),
    detailed_description_tr: project.detailedDescriptionTr.trim(),
    detailed_description_en: project.detailedDescriptionEn.trim(),
    subtitle_tr: project.subtitleTr.trim(),
    subtitle_en: project.subtitleEn.trim(),
    cover_image_url: project.coverImageUrl.trim(),
    gallery_image_urls: uniqueStringList(project.galleryImageUrls),
    location_tr: project.locationTr.trim(),
    location_en: project.locationEn.trim(),
    status_tr: project.statusTr.trim(),
    status_en: project.statusEn.trim(),
    year: project.year.trim(),
    active: project.active !== false,
    featured: Boolean(project.featured),
    sort_order: Number(project.sortOrder) || 0
  };
}

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === "42P01" || candidate.message?.toLowerCase().includes("does not exist") === true;
}

export async function getArchitecturePortfolioData(): Promise<ArchitecturePortfolioData> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const fallbackData = {
      categories: sortCategories(readFallbackCategories()),
      projects: sortProjects(readFallbackProjects())
    };
    writeFallbackData(fallbackData);
    return fallbackData;
  }

  const [catRes, projectRes] = await Promise.all([
    supabase.from("architecture_categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("architecture_projects").select("*").order("sort_order", { ascending: true })
  ]);

  if (!catRes.error && !projectRes.error) {
    const fetchedCategories = sortCategories(
      (catRes.data || []).map((row, index) => mapCategoryRow(row as ArchitectureCategoryRow, index))
    );
    const categories = fetchedCategories.length ? fetchedCategories : sortCategories(buildSeedFromFolderManifest().categories);

    const fetchedProjects = sortProjects(
      (projectRes.data || []).map((row, index) => mapProjectRow(row as ArchitectureProjectRow, index))
    );
    const projects = fetchedProjects.length
      ? fetchedProjects
      : sortProjects(buildSeedFromFolderManifest(categories).projects);

    const data = { categories, projects };
    writeFallbackData(data);
    return data;
  }

  const warning =
    isMissingTableError(catRes.error) || isMissingTableError(projectRes.error)
      ? "Mimarlik tablolari henuz olusturulmadi. Lutfen Supabase schema.sql dosyasini calistirin."
      : "Mimarlik verileri Supabase'den okunamadi. Yerel yedek veriler gosteriliyor.";

  const fallbackData = {
    categories: sortCategories(readFallbackCategories()),
    projects: sortProjects(readFallbackProjects())
  };
  writeFallbackData(fallbackData);
  return {
    ...fallbackData,
    warning
  };
}

export async function upsertArchitectureCategory(
  category: Omit<ArchitectureCategory, "id"> | ArchitectureCategory
): Promise<ArchitectureCategory> {
  const normalized = normalizeCategory(category as Partial<ArchitectureCategory>, 0);
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("architecture_categories")
      .upsert(mapCategoryToRow(normalized), { onConflict: "slug" })
      .select("*")
      .single();
    if (!error && data) {
      const saved = mapCategoryRow(data as ArchitectureCategoryRow, 0);
      const current = await getArchitecturePortfolioData();
      const next = sortCategories([...current.categories.filter((item) => item.id !== saved.id), saved]);
      writeFallbackData({ categories: next, projects: current.projects });
      return saved;
    }
  }

  const current = await getArchitecturePortfolioData();
  const id = (category as ArchitectureCategory).id || normalized.id || `arc-cat-${Date.now()}`;
  const nextItem = { ...normalized, id };
  const nextCategories = sortCategories([...current.categories.filter((item) => item.id !== id), nextItem]);
  writeFallbackData({ categories: nextCategories, projects: current.projects });
  return nextItem;
}

export async function deleteArchitectureCategory(categoryId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    await supabase.from("architecture_projects").delete().eq("category_id", categoryId);
    await supabase.from("architecture_categories").delete().eq("id", categoryId);
  }

  const current = await getArchitecturePortfolioData();
  const nextCategories = current.categories.filter((item) => item.id !== categoryId);
  const nextProjects = current.projects.filter((item) => item.categoryId !== categoryId);
  writeFallbackData({ categories: nextCategories, projects: nextProjects });
  return true;
}

export async function upsertArchitectureProject(
  project: Omit<ArchitectureProject, "id"> | ArchitectureProject
): Promise<ArchitectureProject> {
  const normalized = normalizeProject(project as Partial<ArchitectureProject>, 0);
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("architecture_projects")
      .upsert(mapProjectToRow(normalized), { onConflict: "id" })
      .select("*")
      .single();
    if (!error && data) {
      const saved = mapProjectRow(data as ArchitectureProjectRow, 0);
      const current = await getArchitecturePortfolioData();
      const next = sortProjects([...current.projects.filter((item) => item.id !== saved.id), saved]);
      writeFallbackData({ categories: current.categories, projects: next });
      return saved;
    }
  }

  const current = await getArchitecturePortfolioData();
  const id = (project as ArchitectureProject).id || normalized.id || `arc-prj-${Date.now()}`;
  const nextItem = { ...normalized, id };
  const nextProjects = sortProjects([...current.projects.filter((item) => item.id !== id), nextItem]);
  writeFallbackData({ categories: current.categories, projects: nextProjects });
  return nextItem;
}

export async function deleteArchitectureProject(projectId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    await supabase.from("architecture_projects").delete().eq("id", projectId);
  }

  const current = await getArchitecturePortfolioData();
  const nextProjects = current.projects.filter((item) => item.id !== projectId);
  writeFallbackData({ categories: current.categories, projects: nextProjects });
  return true;
}

export async function syncArchitectureFromFolderManifest(): Promise<ArchitecturePortfolioData> {
  const currentCategories = sortCategories(readFallbackCategories());
  const seeded = buildSeedFromFolderManifest(currentCategories);
  const data = {
    categories: sortCategories(seeded.categories),
    projects: sortProjects(seeded.projects)
  };
  writeFallbackData(data);
  return data;
}
