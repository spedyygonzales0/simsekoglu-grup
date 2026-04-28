import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "İnşaat Hizmetleri | Şimşekoğlu Grup",
  description:
    "Konut, ticari yapı, renovasyon ve anahtar teslim projeler için kurumsal inşaat firması çözümleri.",
  path: "/construction",
  keywords: ["inşaat firması", "anahtar teslim inşaat", "ticari yapı projeleri", "konut inşaat hizmetleri"]
});

export default function ConstructionLayout({ children }: { children: React.ReactNode }) {
  return children;
}

