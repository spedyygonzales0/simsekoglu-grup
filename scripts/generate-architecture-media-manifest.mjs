import fs from "node:fs";
import path from "node:path";

const projectsRoot = path.join(process.cwd(), "public", "images", "architecture", "projects");
const outLegacyFile = path.join(process.cwd(), "lib", "data", "architecture-media-manifest.ts");
const outFolderFile = path.join(process.cwd(), "lib", "data", "architecture-folder-manifest.ts");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"]);

const toWebPath = (filePath) => `/${filePath.split(path.sep).join("/").replace(/^public\//, "")}`;
const encodePathSegment = (segment) =>
  segment
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
const COLLATOR = new Intl.Collator("tr", { numeric: true, sensitivity: "base" });

const normalizeLabel = (value) =>
  value
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const readFilesByExtensions = (dir, extensions) => {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => extensions.has(path.extname(name).toLowerCase()))
    .sort((a, b) => COLLATOR.compare(a, b));
};

const projectDirs = fs.existsSync(projectsRoot)
  ? fs
      .readdirSync(projectsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => COLLATOR.compare(a, b))
  : [];

const legacyRecords = projectDirs.map((projectId) => {
  const projectBase = path.join(projectsRoot, projectId);

  const photoFolder = path.join(projectBase, "photos");
  const posterFolder = path.join(projectBase, "posters");

  const rootImages = readFilesByExtensions(projectBase, IMAGE_EXTENSIONS);
  const nestedImages = readFilesByExtensions(photoFolder, IMAGE_EXTENSIONS);
  const images = (nestedImages.length ? nestedImages : rootImages).map((name) =>
    toWebPath(
      path.join(
        "public",
        "images",
        "architecture",
        "projects",
        projectId,
        nestedImages.length ? "photos" : "",
        name
      )
    )
  );

  const videos = [];

  const posters = readFilesByExtensions(posterFolder, IMAGE_EXTENSIONS).map((name) =>
    toWebPath(path.join("public", "images", "architecture", "projects", projectId, "posters", name))
  );

  return { projectId, photos: images, videos, posters };
});

const legacyLines = [];
legacyLines.push('import { ConstructionProjectMedia } from "@/lib/types";');
legacyLines.push("");
legacyLines.push("// Auto-generated from /public/images/architecture/projects");
legacyLines.push("// Run `npm run media:architecture` after adding new architecture media files.");
legacyLines.push("export const architectureProjectMediaManifest: ConstructionProjectMedia[] = [");

for (const record of legacyRecords) {
  legacyLines.push("  {");
  legacyLines.push(`    projectId: "${record.projectId}",`);
  legacyLines.push(`    photos: ${JSON.stringify(record.photos)},`);
  legacyLines.push(`    videos: ${JSON.stringify(record.videos)},`);
  legacyLines.push(`    posters: ${JSON.stringify(record.posters)}`);
  legacyLines.push("  },");
}

legacyLines.push("];");
legacyLines.push("");

const websiteRoot = path.join(projectsRoot, "website-gorsel");
const categoryMap = {
  KONUT: "konut-projeleri",
  FABRIKA: "fabrika-projeleri",
  VILLA: "villa-projeleri"
};

const folderRecords = [];

if (fs.existsSync(websiteRoot)) {
  const categoryDirs = fs
    .readdirSync(websiteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => COLLATOR.compare(a, b));

  for (const categoryDir of categoryDirs) {
    const normalizedCategoryKey = normalizeLabel(categoryDir);
    const categorySlug = categoryMap[normalizedCategoryKey];
    if (!categorySlug) continue;

    const categoryPath = path.join(websiteRoot, categoryDir);
    const projectFolders = fs
      .readdirSync(categoryPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => COLLATOR.compare(a, b));

    for (const folderName of projectFolders) {
      const folderPath = path.join(categoryPath, folderName);
      const photos = readFilesByExtensions(folderPath, IMAGE_EXTENSIONS).map((fileName) => {
        const rawWebPath = toWebPath(
          path.join(
            "public",
            "images",
            "architecture",
            "projects",
            "website-gorsel",
            categoryDir,
            folderName,
            fileName
          )
        );
        return `/${encodePathSegment(rawWebPath.replace(/^\//, ""))}`;
      });
      if (!photos.length) continue;

      const folderNumber = folderName.padStart(3, "0");
      const projectCodePrefix =
        categorySlug === "konut-projeleri" ? "KNT" : categorySlug === "fabrika-projeleri" ? "FBK" : "VIL";

      const projectTitleTr =
        categorySlug === "konut-projeleri"
          ? `Konut Projesi ${Number(folderName) || folderName}`
          : categorySlug === "fabrika-projeleri"
            ? `Fabrika Projesi ${Number(folderName) || folderName}`
            : `Villa Projesi ${Number(folderName) || folderName}`;

      folderRecords.push({
        id: `${projectCodePrefix}-${folderNumber}`,
        categorySlug,
        titleTr: projectTitleTr,
        titleEn:
          categorySlug === "konut-projeleri"
            ? `Residential Project ${Number(folderName) || folderName}`
            : categorySlug === "fabrika-projeleri"
              ? `Factory Project ${Number(folderName) || folderName}`
              : `Villa Project ${Number(folderName) || folderName}`,
        sortOrder: Number(folderName) || folderRecords.length + 1,
        coverImageUrl: photos[0],
        galleryImageUrls: photos
      });
    }
  }
}

const folderLines = [];
folderLines.push("export interface ArchitectureFolderProjectRecord {");
folderLines.push("  id: string;");
folderLines.push("  categorySlug: \"konut-projeleri\" | \"fabrika-projeleri\" | \"villa-projeleri\";");
folderLines.push("  titleTr: string;");
folderLines.push("  titleEn: string;");
folderLines.push("  sortOrder: number;");
folderLines.push("  coverImageUrl: string;");
folderLines.push("  galleryImageUrls: string[];");
folderLines.push("}");
folderLines.push("");
folderLines.push("// Auto-generated from /public/images/architecture/projects/website-gorsel");
folderLines.push("// Run `npm run media:architecture` after adding architecture images.");
folderLines.push("export const architectureFolderProjectManifest: ArchitectureFolderProjectRecord[] = [");
for (const record of folderRecords) {
  folderLines.push("  {");
  folderLines.push(`    id: "${record.id}",`);
  folderLines.push(`    categorySlug: "${record.categorySlug}",`);
  folderLines.push(`    titleTr: ${JSON.stringify(record.titleTr)},`);
  folderLines.push(`    titleEn: ${JSON.stringify(record.titleEn)},`);
  folderLines.push(`    sortOrder: ${record.sortOrder},`);
  folderLines.push(`    coverImageUrl: ${JSON.stringify(record.coverImageUrl)},`);
  folderLines.push(`    galleryImageUrls: ${JSON.stringify(record.galleryImageUrls)}`);
  folderLines.push("  },");
}
folderLines.push("];");
folderLines.push("");

fs.writeFileSync(outLegacyFile, legacyLines.join("\n"), "utf8");
fs.writeFileSync(outFolderFile, folderLines.join("\n"), "utf8");

console.log(`Generated: ${outLegacyFile}`);
console.log(`Generated: ${outFolderFile}`);
console.log(`Legacy project count: ${legacyRecords.length}`);
console.log(`Website project count: ${folderRecords.length}`);
