import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "İletişim | Şimşekoğlu Grup",
  description:
    "Araç kiralama, filo kiralama, inşaat firması ve mimarlık hizmetleri için Şimşekoğlu Grup iletişim kanalları ve teklif formu.",
  path: "/contact",
  keywords: ["iletişim", "teklif al", "filo kiralama iletişim", "mimarlık hizmetleri iletişim"]
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

