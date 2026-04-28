import { Project, ProjectCategory } from "@/lib/types";

export const IMAGE_FOLDERS = {
  fleet: "/images/fleet",
  construction: "/images/construction",
  architecture: "/images/architecture",
  general: "/images/general"
} as const;

export const CATEGORY_DEFAULT_MEDIA: Record<ProjectCategory, { image: string; video: string }> = {
  construction: {
    image: `${IMAGE_FOLDERS.construction}/project-placeholder-1.svg`,
    video: `${IMAGE_FOLDERS.construction}/video-placeholder.svg`
  },
  architecture: {
    image: `${IMAGE_FOLDERS.architecture}/project-placeholder-1.svg`,
    video: `${IMAGE_FOLDERS.architecture}/video-placeholder.svg`
  },
  fleet: {
    image: `${IMAGE_FOLDERS.fleet}/filo.png`,
    video: `${IMAGE_FOLDERS.fleet}/filo-ana.png`
  }
};

export function isFleetImage(path: string): boolean {
  return path.includes(`${IMAGE_FOLDERS.fleet}/`) || path.includes("/images/fleet/");
}

function isCategoryImage(path: string, category: ProjectCategory): boolean {
  if (category === "fleet") return isFleetImage(path);
  if (category === "construction") {
    return path.includes(`${IMAGE_FOLDERS.construction}/`) || path.includes("/images/construction/");
  }
  return path.includes(`${IMAGE_FOLDERS.architecture}/`) || path.includes("/images/architecture/");
}

function getSafePathByCategory(path: string | undefined, category: ProjectCategory, fallback: string): string {
  if (!path) return fallback;

  if (category === "fleet") {
    return isFleetImage(path) ? path : fallback;
  }

  // Never allow fleet visuals in construction/architecture.
  if (isFleetImage(path)) return fallback;

  return isCategoryImage(path, category) ? path : fallback;
}

export function getSafeProjectImage(project: Project): string {
  const fallback = CATEGORY_DEFAULT_MEDIA[project.category].image;
  return getSafePathByCategory(project.featuredImage || project.imageUrl, project.category, fallback);
}

export function getSafeProjectGalleryImages(project: Project): string[] {
  const fallback = CATEGORY_DEFAULT_MEDIA[project.category].image;
  const candidates = [
    project.featuredImage,
    project.imageUrl,
    ...(Array.isArray(project.galleryImages) ? project.galleryImages : [])
  ];

  const cleaned = candidates
    .map((item) => getSafePathByCategory(item, project.category, ""))
    .filter(Boolean);

  const unique = Array.from(new Set(cleaned));
  return unique.length ? unique : [fallback];
}

export function getSafeProjectVideo(project: Project): string {
  const fallback = CATEGORY_DEFAULT_MEDIA[project.category].video;
  return getSafePathByCategory(project.videoUrl, project.category, fallback);
}

export function ensureFleetImage(path: string): string {
  if (!path) return `${IMAGE_FOLDERS.fleet}/vehicle-placeholder.svg`;
  return isFleetImage(path) ? path : `${IMAGE_FOLDERS.fleet}/vehicle-placeholder.svg`;
}
