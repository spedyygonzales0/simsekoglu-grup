import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Mimarlık Hizmetleri | Şimşekoğlu Grup",
  description:
    "İç mimarlık, dış mimarlık, proje çizimi ve konsept tasarım alanlarında kurumsal mimarlık hizmetleri.",
  path: "/architecture",
  keywords: ["mimarlık hizmetleri", "iç mimarlık", "dış mimarlık", "konsept tasarım"]
});

export default function ArchitectureLayout({ children }: { children: React.ReactNode }) {
  return children;
}

