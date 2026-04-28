import { Metadata } from "next";

export const SITE_URL = "https://simsekoglugrup.com";
export const DEFAULT_OG_IMAGE = "/images/general/hero-placeholder.svg";

const TURKISH_BASE_KEYWORDS = [
  "araç kiralama",
  "filo kiralama",
  "inşaat firması",
  "mimarlık hizmetleri",
  "Şimşekoğlu Grup",
  "kurumsal filo çözümleri"
];

interface BuildMetadataParams {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = DEFAULT_OG_IMAGE
}: BuildMetadataParams): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${SITE_URL}${canonicalPath}`;
  const mergedKeywords = Array.from(new Set([...TURKISH_BASE_KEYWORDS, ...keywords]));

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url,
      siteName: "Şimşekoğlu Grup",
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

