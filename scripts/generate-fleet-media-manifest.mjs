import fs from "node:fs";
import path from "node:path";

const fleetRoot = path.join(process.cwd(), "public", "images", "fleet");
const outFile = path.join(process.cwd(), "lib", "data", "fleet-media-manifest.ts");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const toWebPath = (...parts) =>
  `/${parts
    .filter(Boolean)
    .map((segment) => encodeURIComponent(String(segment)))
    .join("/")}`;

const normalizeLookup = (value) =>
  value
    .toLowerCase()
    .replaceAll("ı", "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const sortedFiles = (dirPath) =>
  fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "tr", { numeric: true, sensitivity: "base" }));

const vehicleFolders = [];

if (fs.existsSync(fleetRoot)) {
  const firstLevelDirs = fs
    .readdirSync(fleetRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const dirName of firstLevelDirs) {
    const absolute = path.join(fleetRoot, dirName);
    if (dirName.toLowerCase() === "aracresimleri") {
      const nested = fs
        .readdirSync(absolute, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
      for (const nestedName of nested) {
        vehicleFolders.push({
          folder: nestedName,
          basePath: path.join("public", "images", "fleet", dirName, nestedName),
          absolutePath: path.join(absolute, nestedName)
        });
      }
      continue;
    }
    vehicleFolders.push({
      folder: dirName,
      basePath: path.join("public", "images", "fleet", dirName),
      absolutePath: absolute
    });
  }
}

const records = vehicleFolders
  .map((item) => {
    const relativeParts = item.basePath.split(path.sep).slice(1);
    const images = sortedFiles(item.absolutePath).map((fileName) => toWebPath(...relativeParts, fileName));
    return {
      folder: item.folder,
      normalizedFolder: normalizeLookup(item.folder),
      images
    };
  })
  .filter((item) => item.images.length > 0)
  .sort((a, b) => a.folder.localeCompare(b.folder, "tr", { numeric: true, sensitivity: "base" }));

const lines = [];
lines.push("export interface FleetMediaManifestRecord {");
lines.push("  folder: string;");
lines.push("  normalizedFolder: string;");
lines.push("  images: string[];");
lines.push("}");
lines.push("");
lines.push("// Auto-generated from /public/images/fleet and /public/images/fleet/aracresimleri");
lines.push("// Run `npm run media:fleet` after adding or changing vehicle images.");
lines.push("export const fleetMediaManifest: FleetMediaManifestRecord[] = [");
for (const record of records) {
  lines.push("  {");
  lines.push(`    folder: ${JSON.stringify(record.folder)},`);
  lines.push(`    normalizedFolder: ${JSON.stringify(record.normalizedFolder)},`);
  lines.push(`    images: ${JSON.stringify(record.images)}`);
  lines.push("  },");
}
lines.push("];");
lines.push("");

fs.writeFileSync(outFile, lines.join("\n"), "utf8");
console.log(`Generated: ${outFile}`);
console.log(`Vehicle folders: ${records.length}`);
