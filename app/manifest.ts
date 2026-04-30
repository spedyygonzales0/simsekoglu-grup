import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Şimşekoğlu Grup",
    short_name: "Şimşekoğlu",
    description: "Kurumsal inşaat, mimarlık ve filo kiralama çözümleri.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f5f8",
    theme_color: "#031a3d",
    icons: [
      {
        src: "/images/general/logo.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/images/general/logo.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}

