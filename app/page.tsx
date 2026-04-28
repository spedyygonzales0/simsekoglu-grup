import { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Şimşekoğlu Grup | Araç Kiralama, Filo Kiralama, İnşaat Firması",
  description:
    "Şimşekoğlu Grup ile araç kiralama, filo kiralama, inşaat firması ve mimarlık hizmetleri için kurumsal çözümleri keşfedin.",
  path: "/",
  keywords: ["kurumsal araç kiralama", "kurumsal inşaat", "mimarlık hizmetleri istanbul"]
});

export default function Page() {
  return <HomePage />;
}
