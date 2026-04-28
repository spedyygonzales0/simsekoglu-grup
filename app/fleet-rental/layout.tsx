import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Araç Kiralama ve Filo Kiralama | Şimşekoğlu Grup",
  description:
    "Kurumsal araç kiralama ve filo kiralama çözümleri: farklı segmentlerde aylık kiralama seçenekleri ve profesyonel operasyon desteği.",
  path: "/fleet-rental",
  keywords: ["araç kiralama", "filo kiralama", "kurumsal araç kiralama", "aylık araç kiralama"]
});

export default function FleetRentalLayout({ children }: { children: React.ReactNode }) {
  return children;
}

