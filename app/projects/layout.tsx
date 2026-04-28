import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Projeler | Şimşekoğlu Grup",
  description:
    "İnşaat firması, mimarlık hizmetleri ve filo kiralama alanlarında tamamlanan ve devam eden kurumsal projelerimizi inceleyin.",
  path: "/projects",
  keywords: ["projeler", "inşaat projeleri", "mimarlık projeleri", "filo kiralama projeleri"]
});

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

