import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Mimarlık Projeleri | Şimşekoğlu Grup",
  description: "Konut, fabrika ve villa kategorilerinde mimarlık projelerini inceleyin.",
  path: "/architecture",
  keywords: ["mimarlık hizmetleri", "konut projeleri", "villa projeleri", "fabrika projeleri"]
});

export default function ArchitectureLayout({ children }: { children: React.ReactNode }) {
  return children;
}
