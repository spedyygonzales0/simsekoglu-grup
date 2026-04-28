import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Projeler Detayları | Şimşekoğlu Grup",
  description:
    "İnşaat firması, mimarlık hizmetleri ve filo kiralama projelerinin detay sayfalarını inceleyin.",
  path: "/projeler",
  keywords: ["proje detay", "inşaat projeleri detay", "mimarlık hizmetleri projeleri"]
});

export default function ProjelerLayout({ children }: { children: React.ReactNode }) {
  return children;
}

