import { Project } from "@/lib/types";

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  Ç: "c",
  Ğ: "g",
  Ö: "o",
  Ş: "s",
  Ü: "u"
};

function normalizeTurkish(value: string): string {
  return value
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] ?? char)
    .join("");
}

export function slugifyProjectText(value: string): string {
  return normalizeTurkish(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getProjectSlug(project: Project): string {
  const base = slugifyProjectText(project.titleTr || project.titleEn || project.id);
  const idPart = slugifyProjectText(project.id || "project");
  return `${base}-${idPart}`;
}

export function projectMatchesSlug(project: Project, slug: string): boolean {
  const primarySlug = getProjectSlug(project);
  const legacySlug = slugifyProjectText(project.titleTr || project.titleEn || project.id);
  return slug === primarySlug || slug === legacySlug;
}

