import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { SiteDataProvider } from "@/components/providers/site-data-provider";
import "./globals.css";

const siteUrl = "https://simsekoglugrup.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Şimşekoğlu Grup | İnşaat, Mimarlık, Araç Kiralama",
    template: "%s | Şimşekoğlu Grup"
  },
  description:
    "Şimşekoğlu Grup resmi kurumsal web sitesi: inşaat, mimarlık ve kurumsal filo kiralama hizmetleri.",
  keywords: [
    "araç kiralama",
    "filo kiralama",
    "inşaat firması",
    "mimarlık hizmetleri",
    "Şimşekoğlu Grup"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "Şimşekoğlu Grup",
    title: "Şimşekoğlu Grup | İnşaat, Mimarlık, Araç Kiralama",
    description:
      "Kurumsal inşaat, mimarlık ve filo kiralama çözümlerinde güçlü proje ortağınız.",
    images: [
      {
        url: "/images/general/hero-placeholder.svg",
        width: 1200,
        height: 630,
        alt: "Şimşekoğlu Grup"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Şimşekoğlu Grup | İnşaat, Mimarlık, Araç Kiralama",
    description:
      "Kurumsal inşaat, mimarlık ve filo kiralama çözümlerinde güçlü proje ortağınız.",
    images: ["/images/general/hero-placeholder.svg"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <SiteDataProvider>
          <SiteShell>{children}</SiteShell>
        </SiteDataProvider>
      </body>
    </html>
  );
}
