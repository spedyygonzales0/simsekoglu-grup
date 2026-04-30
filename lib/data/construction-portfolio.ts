import { constructionProjectMediaManifest } from "@/lib/data/construction-media-manifest";
import { ConstructionContent, ProjectCardTextContent, ProjectCardTextGroups } from "@/lib/types";

export interface ConstructionPortfolioCategory {
  id: "factory" | "housing";
  slug: "fabrika-sanayi-projeleri" | "konut-projeleri";
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  coverImageUrl: string;
}

export interface ConstructionPortfolioProject {
  id: string;
  slug: string;
  categorySlug: ConstructionPortfolioCategory["slug"];
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  detailedTr: string;
  detailedEn: string;
  locationTr: string;
  locationEn: string;
  statusTr: string;
  statusEn: string;
  coverImageUrl: string;
  images: string[];
  videoUrl?: string;
}

const CONSTRUCTION_PLACEHOLDER = "/images/construction/project-placeholder-1.svg";

function sortByProjectCode(a: string, b: string): number {
  const [aPrefix, aNumRaw] = a.split("-");
  const [bPrefix, bNumRaw] = b.split("-");
  if (aPrefix !== bPrefix) return aPrefix.localeCompare(bPrefix, "tr");
  const aNum = Number(aNumRaw || 0);
  const bNum = Number(bNumRaw || 0);
  return aNum - bNum;
}

function defaultCardText(projectId: string): ProjectCardTextContent {
  return {
    titleTr: projectId,
    titleEn: projectId,
    summaryTr: `${projectId} için yüklenen saha görselleri ve proje kayıtları.`,
    summaryEn: `Uploaded field visuals and project records for ${projectId}.`,
    locationTr: "Türkiye",
    locationEn: "Turkey"
  };
}

export function getConstructionPortfolioData(params: {
  constructionContent: ConstructionContent;
  projectCardTexts?: ProjectCardTextGroups["construction"];
}) {
  const { constructionContent, projectCardTexts = {} } = params;

  const projects: ConstructionPortfolioProject[] = constructionProjectMediaManifest
    .slice()
    .sort((a, b) => sortByProjectCode(a.projectId, b.projectId))
    .map((item) => {
      const isHousing = item.projectId.startsWith("KNT-");
      const cardText = projectCardTexts[item.projectId] || defaultCardText(item.projectId);
      const images = item.photos.length ? item.photos : [CONSTRUCTION_PLACEHOLDER];
      const photoCount = item.photos.length;
      const videoCount = item.videos.length;

      return {
        id: item.projectId,
        slug: item.projectId.toLowerCase(),
        categorySlug: isHousing ? "konut-projeleri" : "fabrika-sanayi-projeleri",
        titleTr: cardText.titleTr || item.projectId,
        titleEn: cardText.titleEn || item.projectId,
        summaryTr: cardText.summaryTr,
        summaryEn: cardText.summaryEn,
        detailedTr: `${cardText.summaryTr}\n\n${photoCount} fotoğraf${videoCount ? `, ${videoCount} video` : ""} yüklenmiştir.`,
        detailedEn: `${cardText.summaryEn}\n\n${photoCount} photos${videoCount ? `, ${videoCount} videos` : ""} uploaded.`,
        locationTr: cardText.locationTr || "Türkiye",
        locationEn: cardText.locationEn || "Turkey",
        statusTr: videoCount > 0 ? "Devam Ediyor" : "Tamamlandı",
        statusEn: videoCount > 0 ? "Ongoing" : "Completed",
        coverImageUrl: images[0] || CONSTRUCTION_PLACEHOLDER,
        images,
        videoUrl: item.videos[0]
      };
    });

  const factoryCover =
    projects.find((project) => project.categorySlug === "fabrika-sanayi-projeleri")?.coverImageUrl ||
    CONSTRUCTION_PLACEHOLDER;
  const housingCover =
    projects.find((project) => project.categorySlug === "konut-projeleri")?.coverImageUrl ||
    CONSTRUCTION_PLACEHOLDER;

  const categories: ConstructionPortfolioCategory[] = [
    {
      id: "factory",
      slug: "fabrika-sanayi-projeleri",
      titleTr: "Fabrika / Sanayi Projeleri",
      titleEn: "Factory / Industrial Projects",
      descriptionTr: constructionContent.commercialTr,
      descriptionEn: constructionContent.commercialEn,
      coverImageUrl: factoryCover
    },
    {
      id: "housing",
      slug: "konut-projeleri",
      titleTr: "Konut Projeleri",
      titleEn: "Residential Projects",
      descriptionTr: constructionContent.residentialTr,
      descriptionEn: constructionContent.residentialEn,
      coverImageUrl: housingCover
    }
  ];

  return { categories, projects };
}

