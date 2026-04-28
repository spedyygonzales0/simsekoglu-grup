import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Hakkımızda | Şimşekoğlu Grup",
  description:
    "Şimşekoğlu Grup hakkında kurumsal bilgi: araç kiralama, filo kiralama, inşaat firması ve mimarlık hizmetleri deneyimimiz.",
  path: "/about",
  keywords: ["hakkımızda", "kurumsal firma", "inşaat firması hakkında", "mimarlık hizmetleri şirketi"]
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

