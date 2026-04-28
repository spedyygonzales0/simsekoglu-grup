import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

interface ProjectDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

function slugToTitle(slug: string): string {
  const normalized = slug
    .split("-")
    .filter(Boolean)
    .slice(0, -1)
    .join(" ");
  return normalized || "Proje Detayı";
}

export async function generateMetadata({ params }: ProjectDetailLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const projectTitle = slugToTitle(slug);
  const title = `${projectTitle} | Proje Detayı | Şimşekoğlu Grup`;

  return buildPageMetadata({
    title,
    description:
      "Proje detay sayfası: galeri, video, tarih, konum ve açıklama bilgileriyle inşaat firması ve mimarlık hizmetleri portföyü.",
    path: `/projeler/${slug}`,
    keywords: ["proje detayı", "proje galerisi", "inşaat firması proje", "mimarlık hizmetleri proje detayı"]
  });
}

export default function ProjectDetailLayout({ children }: ProjectDetailLayoutProps) {
  return children;
}

