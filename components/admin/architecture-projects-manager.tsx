"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { defaultArchitectureCategories } from "@/lib/data/default-architecture-content";
import {
  deleteArchitectureCategory,
  deleteArchitectureProject,
  getArchitecturePortfolioData,
  upsertArchitectureCategory,
  upsertArchitectureProject
} from "@/lib/services/architecture-service";
import { ArchitectureCategory, ArchitectureProject } from "@/lib/types";
import { MediaUploader } from "./media-uploader";

type ManagerTab = "projects" | "categories";

function slugify(value: string): string {
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

function createCategoryForm(): Omit<ArchitectureCategory, "id"> {
  return {
    titleTr: "",
    titleEn: "",
    slug: "",
    descriptionTr: "",
    descriptionEn: "",
    coverImageUrl: "/images/architecture/project-placeholder-1.svg",
    active: true,
    sortOrder: 0
  };
}

function createProjectForm(categoryId = ""): Omit<ArchitectureProject, "id"> {
  return {
    categoryId,
    titleTr: "",
    titleEn: "",
    slug: "",
    shortDescriptionTr: "",
    shortDescriptionEn: "",
    detailedDescriptionTr: "",
    detailedDescriptionEn: "",
    subtitleTr: "",
    subtitleEn: "",
    coverImageUrl: "/images/architecture/project-placeholder-1.svg",
    galleryImageUrls: [],
    locationTr: "",
    locationEn: "",
    statusTr: "",
    statusEn: "",
    year: "",
    active: true,
    featured: false,
    sortOrder: 0
  };
}

interface ArchitectureProjectsManagerProps {
  onSaved?: (message: string) => void;
}

function PanelButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-navy-900 text-white" : "border border-navy-900/20 bg-white text-navy-900 hover:bg-cloud-50"
      }`}
    >
      {children}
    </button>
  );
}

export function ArchitectureProjectsManager({ onSaved }: ArchitectureProjectsManagerProps) {
  const [categories, setCategories] = useState<ArchitectureCategory[]>([]);
  const [projects, setProjects] = useState<ArchitectureProject[]>([]);

  const [tab, setTab] = useState<ManagerTab>("projects");
  const [projectSearch, setProjectSearch] = useState("");

  const [categoryForm, setCategoryForm] = useState<Omit<ArchitectureCategory, "id">>(createCategoryForm);
  const [projectForm, setProjectForm] = useState<Omit<ArchitectureProject, "id">>(createProjectForm);

  const [categoryEditId, setCategoryEditId] = useState<string | null>(null);
  const [projectEditId, setProjectEditId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");
  const [statusText, setStatusText] = useState("");

  const loadData = async () => {
    setLoading(true);
    const data = await getArchitecturePortfolioData();
    setCategories(data.categories);
    setProjects(data.projects);
    setWarning(data.warning || "");
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (categoryForm.slug.trim()) return;
    if (!categoryForm.titleTr.trim()) return;
    setCategoryForm((prev) => ({ ...prev, slug: slugify(prev.titleTr) }));
  }, [categoryForm.slug, categoryForm.titleTr]);

  useEffect(() => {
    if (projectForm.slug.trim()) return;
    if (!projectForm.titleTr.trim()) return;
    setProjectForm((prev) => ({ ...prev, slug: slugify(prev.titleTr) }));
  }, [projectForm.slug, projectForm.titleTr]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.titleTr.localeCompare(b.titleTr, "tr")),
    [categories]
  );

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.sortOrder - b.sortOrder || a.titleTr.localeCompare(b.titleTr, "tr")),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    if (!q) return sortedProjects;
    return sortedProjects.filter((item) => {
      return (
        item.titleTr.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      );
    });
  }, [projectSearch, sortedProjects]);

  const groupedProjects = useMemo(() => {
    return sortedCategories.map((category) => ({
      category,
      items: filteredProjects.filter((item) => item.categoryId === category.id)
    }));
  }, [filteredProjects, sortedCategories]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, ArchitectureCategory>();
    categories.forEach((item) => map.set(item.id, item));
    return map;
  }, [categories]);

  const saveCategory = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      ...categoryForm,
      titleTr: categoryForm.titleTr.trim(),
      titleEn: categoryForm.titleEn.trim() || categoryForm.titleTr.trim(),
      slug: slugify(categoryForm.slug || categoryForm.titleTr),
      descriptionTr: categoryForm.descriptionTr.trim(),
      descriptionEn: categoryForm.descriptionEn.trim(),
      coverImageUrl: categoryForm.coverImageUrl.trim() || "/images/architecture/project-placeholder-1.svg"
    };
    if (!payload.titleTr || !payload.slug) return;

    await upsertArchitectureCategory(categoryEditId ? { ...payload, id: categoryEditId } : payload);
    await loadData();
    setCategoryEditId(null);
    setCategoryForm(createCategoryForm());
    setStatusText("Mimarlık kategorisi kaydedildi.");
    onSaved?.("Mimarlık kategorisi kaydedildi.");
  };

  const saveProject = async (event: FormEvent) => {
    event.preventDefault();
    if (!projectForm.categoryId) return;

    const payload = {
      ...projectForm,
      titleTr: projectForm.titleTr.trim(),
      titleEn: projectForm.titleEn.trim() || projectForm.titleTr.trim(),
      slug: slugify(projectForm.slug || projectForm.titleTr),
      shortDescriptionTr: projectForm.shortDescriptionTr.trim(),
      shortDescriptionEn: projectForm.shortDescriptionEn.trim(),
      detailedDescriptionTr: projectForm.detailedDescriptionTr.trim(),
      detailedDescriptionEn: projectForm.detailedDescriptionEn.trim(),
      subtitleTr: projectForm.subtitleTr.trim(),
      subtitleEn: projectForm.subtitleEn.trim(),
      coverImageUrl: projectForm.coverImageUrl.trim() || "/images/architecture/project-placeholder-1.svg",
      galleryImageUrls: Array.from(new Set([projectForm.coverImageUrl, ...(projectForm.galleryImageUrls || [])].filter(Boolean)))
    };

    if (!payload.titleTr || !payload.slug) return;

    await upsertArchitectureProject(projectEditId ? { ...payload, id: projectEditId } : payload);
    await loadData();
    setProjectEditId(null);
    setProjectForm(createProjectForm(payload.categoryId));
    setStatusText("Mimarlık projesi kaydedildi.");
    onSaved?.("Mimarlık projesi kaydedildi.");
  };

  const editCategory = (item: ArchitectureCategory) => {
    setTab("categories");
    setCategoryEditId(item.id);
    setCategoryForm({
      titleTr: item.titleTr,
      titleEn: item.titleEn,
      slug: item.slug,
      descriptionTr: item.descriptionTr,
      descriptionEn: item.descriptionEn,
      coverImageUrl: item.coverImageUrl,
      active: item.active,
      sortOrder: item.sortOrder
    });
  };

  const editProject = (item: ArchitectureProject) => {
    setTab("projects");
    setProjectEditId(item.id);
    setProjectForm({
      categoryId: item.categoryId,
      titleTr: item.titleTr,
      titleEn: item.titleEn,
      slug: item.slug,
      shortDescriptionTr: item.shortDescriptionTr,
      shortDescriptionEn: item.shortDescriptionEn,
      detailedDescriptionTr: item.detailedDescriptionTr,
      detailedDescriptionEn: item.detailedDescriptionEn,
      subtitleTr: item.subtitleTr,
      subtitleEn: item.subtitleEn,
      coverImageUrl: item.coverImageUrl,
      galleryImageUrls: item.galleryImageUrls,
      locationTr: item.locationTr,
      locationEn: item.locationEn,
      statusTr: item.statusTr,
      statusEn: item.statusEn,
      year: item.year,
      active: item.active,
      featured: item.featured,
      sortOrder: item.sortOrder
    });
  };

  const removeCategory = async (item: ArchitectureCategory) => {
    const hasProject = projects.some((project) => project.categoryId === item.id);
    const confirmText = hasProject
      ? "Bu kategori silinirse içindeki projeler de silinir. Devam etmek istiyor musunuz?"
      : "Kategoriyi silmek istediğinize emin misiniz?";
    if (!window.confirm(confirmText)) return;
    await deleteArchitectureCategory(item.id);
    await loadData();
    if (categoryEditId === item.id) {
      setCategoryEditId(null);
      setCategoryForm(createCategoryForm());
    }
    setStatusText("Kategori silindi.");
    onSaved?.("Kategori silindi.");
  };

  const removeProject = async (item: ArchitectureProject) => {
    if (!window.confirm("Projeyi silmek istediğinize emin misiniz?")) return;
    await deleteArchitectureProject(item.id);
    await loadData();
    if (projectEditId === item.id) {
      setProjectEditId(null);
      setProjectForm(createProjectForm(sortedCategories[0]?.id || ""));
    }
    setStatusText("Proje silindi.");
    onSaved?.("Proje silindi.");
  };

  useEffect(() => {
    if (projectForm.categoryId) return;
    if (!sortedCategories.length) return;
    setProjectForm((prev) => ({ ...prev, categoryId: sortedCategories[0].id }));
  }, [projectForm.categoryId, sortedCategories]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-navy-900/10 bg-cloud-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-navy-900">Mimarlık Portföy Yönetimi</p>
            <p className="text-xs text-navy-900/70">Kategori ve projeleri buradan manuel olarak yönetin.</p>
          </div>
          <div className="flex items-center gap-2">
            <PanelButton active={tab === "projects"} onClick={() => setTab("projects")}>Projeler</PanelButton>
            <PanelButton active={tab === "categories"} onClick={() => setTab("categories")}>Kategoriler</PanelButton>
          </div>
        </div>
      </div>

      {warning ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{warning}</div>
      ) : null}

      {statusText ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{statusText}</div>
      ) : null}

      {tab === "categories" ? (
        <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-bold text-navy-900">Kategori Formu</h3>
            <form onSubmit={saveCategory} className="mt-4 grid gap-3">
              <label className="space-y-1">
                <span className="admin-label">Başlık (TR)</span>
                <input value={categoryForm.titleTr} onChange={(e) => setCategoryForm((p) => ({ ...p, titleTr: e.target.value }))} className="admin-input" />
              </label>
              <label className="space-y-1">
                <span className="admin-label">Başlık (EN)</span>
                <input value={categoryForm.titleEn} onChange={(e) => setCategoryForm((p) => ({ ...p, titleEn: e.target.value }))} className="admin-input" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="admin-label">Slug</span>
                  <input value={categoryForm.slug} onChange={(e) => setCategoryForm((p) => ({ ...p, slug: e.target.value }))} className="admin-input" />
                </label>
                <label className="space-y-1">
                  <span className="admin-label">Sıralama</span>
                  <input type="number" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))} className="admin-input" />
                </label>
              </div>
              <label className="space-y-1">
                <span className="admin-label">Açıklama (TR)</span>
                <textarea rows={2} value={categoryForm.descriptionTr} onChange={(e) => setCategoryForm((p) => ({ ...p, descriptionTr: e.target.value }))} className="admin-input" />
              </label>
              <label className="space-y-1">
                <span className="admin-label">Açıklama (EN)</span>
                <textarea rows={2} value={categoryForm.descriptionEn} onChange={(e) => setCategoryForm((p) => ({ ...p, descriptionEn: e.target.value }))} className="admin-input" />
              </label>
              <label className="space-y-1">
                <span className="admin-label">Kapak Görsel URL</span>
                <input value={categoryForm.coverImageUrl} onChange={(e) => setCategoryForm((p) => ({ ...p, coverImageUrl: e.target.value }))} className="admin-input" />
              </label>

              <MediaUploader
                entitySlug={categoryForm.slug || categoryForm.titleTr || "architecture-category"}
                folderPrefix="architecture"
                value={categoryForm.coverImageUrl ? [categoryForm.coverImageUrl] : []}
                onChange={(urls) => setCategoryForm((p) => ({ ...p, coverImageUrl: urls[0] || "/images/architecture/project-placeholder-1.svg" }))}
                title="Kategori kapak görseli"
              />

              <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
                <input type="checkbox" checked={categoryForm.active} onChange={(e) => setCategoryForm((p) => ({ ...p, active: e.target.checked }))} />
                Aktif
              </label>

              <div className="flex gap-2">
                <button type="submit" className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white">
                  {categoryEditId ? "Güncelle" : "Kategori Ekle"}
                </button>
                {categoryEditId ? (
                  <button type="button" onClick={() => { setCategoryEditId(null); setCategoryForm(createCategoryForm()); }} className="rounded-lg border border-navy-900/20 px-4 py-2 text-sm font-semibold text-navy-900">
                    İptal
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-soft">
            <h3 className="text-xl font-bold text-navy-900">Kategori Listesi</h3>
            <div className="mt-4 space-y-3">
              {sortedCategories.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-900/10 bg-cloud-50 p-3">
                  <div>
                    <p className="font-semibold text-navy-900">{item.titleTr}</p>
                    <p className="text-xs text-navy-900/65">{item.slug} • Sıra: {item.sortOrder}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => editCategory(item)} className="rounded border border-navy-900/20 px-3 py-1.5 text-xs font-semibold text-navy-900">Düzenle</button>
                    {!defaultArchitectureCategories.some((d) => d.slug === item.slug) ? (
                      <button type="button" onClick={() => void removeCategory(item)} className="rounded border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600">Sil</button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "projects" ? (
        <section className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
          <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-navy-900">Proje Formu</h3>
              {projectEditId ? (
                <span className="rounded-full bg-gold-100 px-2 py-1 text-xs font-semibold text-gold-700">Düzenleme Modu</span>
              ) : null}
            </div>
            <form onSubmit={saveProject} className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="admin-label">Kategori</span>
                  <select value={projectForm.categoryId} onChange={(e) => setProjectForm((p) => ({ ...p, categoryId: e.target.value }))} className="admin-input">
                    <option value="">Kategori seçin</option>
                    {sortedCategories.map((item) => (
                      <option key={item.id} value={item.id}>{item.titleTr}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="admin-label">Sıralama</span>
                  <input type="number" value={projectForm.sortOrder} onChange={(e) => setProjectForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))} className="admin-input" />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="admin-label">Başlık (TR)</span>
                  <input value={projectForm.titleTr} onChange={(e) => setProjectForm((p) => ({ ...p, titleTr: e.target.value }))} className="admin-input" />
                </label>
                <label className="space-y-1">
                  <span className="admin-label">Başlık (EN)</span>
                  <input value={projectForm.titleEn} onChange={(e) => setProjectForm((p) => ({ ...p, titleEn: e.target.value }))} className="admin-input" />
                </label>
              </div>

              <label className="space-y-1">
                <span className="admin-label">Slug</span>
                <input value={projectForm.slug} onChange={(e) => setProjectForm((p) => ({ ...p, slug: e.target.value }))} className="admin-input" />
              </label>

              <label className="space-y-1">
                <span className="admin-label">Kısa Açıklama (TR)</span>
                <textarea rows={2} value={projectForm.shortDescriptionTr} onChange={(e) => setProjectForm((p) => ({ ...p, shortDescriptionTr: e.target.value }))} className="admin-input" />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="admin-label">Konum (TR)</span>
                  <input value={projectForm.locationTr} onChange={(e) => setProjectForm((p) => ({ ...p, locationTr: e.target.value }))} className="admin-input" />
                </label>
                <label className="space-y-1">
                  <span className="admin-label">Yıl</span>
                  <input value={projectForm.year} onChange={(e) => setProjectForm((p) => ({ ...p, year: e.target.value }))} className="admin-input" />
                </label>
              </div>

              <details className="rounded-lg border border-navy-900/10 bg-cloud-50 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-navy-900">Gelişmiş Alanlar (EN + Detay)</summary>
                <div className="mt-3 grid gap-3">
                  <label className="space-y-1">
                    <span className="admin-label">Kısa Açıklama (EN)</span>
                    <textarea rows={2} value={projectForm.shortDescriptionEn} onChange={(e) => setProjectForm((p) => ({ ...p, shortDescriptionEn: e.target.value }))} className="admin-input" />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="admin-label">Alt Başlık (TR)</span>
                      <input value={projectForm.subtitleTr} onChange={(e) => setProjectForm((p) => ({ ...p, subtitleTr: e.target.value }))} className="admin-input" />
                    </label>
                    <label className="space-y-1">
                      <span className="admin-label">Alt Başlık (EN)</span>
                      <input value={projectForm.subtitleEn} onChange={(e) => setProjectForm((p) => ({ ...p, subtitleEn: e.target.value }))} className="admin-input" />
                    </label>
                  </div>
                  <label className="space-y-1">
                    <span className="admin-label">Detaylı Açıklama (TR)</span>
                    <textarea rows={4} value={projectForm.detailedDescriptionTr} onChange={(e) => setProjectForm((p) => ({ ...p, detailedDescriptionTr: e.target.value }))} className="admin-input" />
                  </label>
                  <label className="space-y-1">
                    <span className="admin-label">Detaylı Açıklama (EN)</span>
                    <textarea rows={4} value={projectForm.detailedDescriptionEn} onChange={(e) => setProjectForm((p) => ({ ...p, detailedDescriptionEn: e.target.value }))} className="admin-input" />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="admin-label">Konum (EN)</span>
                      <input value={projectForm.locationEn} onChange={(e) => setProjectForm((p) => ({ ...p, locationEn: e.target.value }))} className="admin-input" />
                    </label>
                    <label className="space-y-1">
                      <span className="admin-label">Durum (TR)</span>
                      <input value={projectForm.statusTr} onChange={(e) => setProjectForm((p) => ({ ...p, statusTr: e.target.value }))} className="admin-input" />
                    </label>
                  </div>
                  <label className="space-y-1">
                    <span className="admin-label">Durum (EN)</span>
                    <input value={projectForm.statusEn} onChange={(e) => setProjectForm((p) => ({ ...p, statusEn: e.target.value }))} className="admin-input" />
                  </label>
                </div>
              </details>

              <label className="space-y-1">
                <span className="admin-label">Kapak Görsel URL</span>
                <input value={projectForm.coverImageUrl} onChange={(e) => setProjectForm((p) => ({ ...p, coverImageUrl: e.target.value }))} className="admin-input" />
              </label>

              <MediaUploader
                entitySlug={projectForm.slug || projectForm.titleTr || "architecture-project"}
                folderPrefix="architecture"
                value={projectForm.coverImageUrl ? [projectForm.coverImageUrl] : []}
                onChange={(urls) => setProjectForm((p) => ({ ...p, coverImageUrl: urls[0] || "/images/architecture/project-placeholder-1.svg" }))}
                title="Kapak görseli"
              />

              <MediaUploader
                entitySlug={`${projectForm.slug || "architecture-project"}-gallery`}
                folderPrefix="architecture"
                value={projectForm.galleryImageUrls || []}
                onChange={(urls) => setProjectForm((p) => ({ ...p, galleryImageUrls: urls }))}
                title="Galeri görselleri"
              />

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
                  <input type="checkbox" checked={projectForm.active} onChange={(e) => setProjectForm((p) => ({ ...p, active: e.target.checked }))} /> Aktif
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
                  <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm((p) => ({ ...p, featured: e.target.checked }))} /> Öne Çıkan
                </label>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white">
                  {projectEditId ? "Projeyi Güncelle" : "Proje Ekle"}
                </button>
                {projectEditId ? (
                  <button type="button" onClick={() => { setProjectEditId(null); setProjectForm(createProjectForm(sortedCategories[0]?.id || "")); }} className="rounded-lg border border-navy-900/20 px-4 py-2 text-sm font-semibold text-navy-900">
                    İptal
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-soft">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-navy-900">Proje Listesi</h3>
              <p className="text-xs text-navy-900/70">Toplam {sortedProjects.length} proje</p>
            </div>
            <input
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder="Proje ara (başlık / slug)"
              className="admin-input"
            />
            <div className="mt-4 space-y-5">
              {groupedProjects.map(({ category, items }) => (
                <div key={category.id} className="space-y-2">
                  <p className="text-sm font-bold text-navy-900">{category.titleTr}</p>
                  {items.length ? (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-900/10 bg-cloud-50 p-3">
                          <div>
                            <p className="font-semibold text-navy-900">{item.titleTr}</p>
                            <p className="text-xs text-navy-900/65">{categoryMap.get(item.categoryId)?.titleTr || "Kategori yok"} • {item.slug}</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => editProject(item)} className="rounded border border-navy-900/20 px-3 py-1.5 text-xs font-semibold text-navy-900">Düzenle</button>
                            <button type="button" onClick={() => void removeProject(item)} className="rounded border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600">Sil</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed border-navy-900/20 bg-white px-3 py-2 text-xs text-navy-900/65">
                      Bu kategoride proje bulunmuyor.
                    </p>
                  )}
                </div>
              ))}
              {!loading && !filteredProjects.length ? (
                <p className="text-sm text-navy-900/70">Arama kriterine uygun proje bulunamadı.</p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
