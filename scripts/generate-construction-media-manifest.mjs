import fs from "node:fs";
import path from "node:path";

const projectsRoot = path.join(process.cwd(), "public", "images", "construction", "projects");
const outFile = path.join(process.cwd(), "lib", "data", "construction-media-manifest.ts");

const toWebPath = (filePath) =>
  `/${filePath.split(path.sep).join("/").replace(/^public\//, "")}`;

const readFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "tr", { numeric: true, sensitivity: "base" }));
};

const projectDirs = fs.existsSync(projectsRoot)
  ? fs
      .readdirSync(projectsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, "tr", { numeric: true, sensitivity: "base" }))
  : [];

const records = projectDirs.map((projectId) => {
  const base = path.join(projectsRoot, projectId);
  const photos = readFiles(path.join(base, "photos")).map((name) =>
    toWebPath(path.join("public", "images", "construction", "projects", projectId, "photos", name))
  );
  const videos = readFiles(path.join(base, "videos")).map((name) =>
    toWebPath(path.join("public", "images", "construction", "projects", projectId, "videos", name))
  );
  const posters = readFiles(path.join(base, "posters")).map((name) =>
    toWebPath(path.join("public", "images", "construction", "projects", projectId, "posters", name))
  );

  return { projectId, photos, videos, posters };
});

const lines = [];
lines.push('import { ConstructionProjectMedia } from "@/lib/types";');
lines.push("");
lines.push("// Auto-generated from /public/images/construction/projects");
lines.push("// Run `npm run media:construction` after adding new construction media files.");
lines.push("export const constructionProjectMediaManifest: ConstructionProjectMedia[] = [");

for (const record of records) {
  lines.push("  {");
  lines.push(`    projectId: "${record.projectId}",`);
  lines.push(`    photos: ${JSON.stringify(record.photos)},`);
  lines.push(`    videos: ${JSON.stringify(record.videos)},`);
  lines.push(`    posters: ${JSON.stringify(record.posters)}`);
  lines.push("  },");
}

lines.push("];");
lines.push("");

fs.writeFileSync(outFile, lines.join("\n"), "utf8");
console.log(`Generated: ${outFile}`);
console.log(`Project count: ${records.length}`);
console.log(`Projects with photos: ${records.filter((item) => item.photos.length > 0).length}`);
