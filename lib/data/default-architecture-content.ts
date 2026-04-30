import { ArchitectureCategory, ArchitectureProject } from "@/lib/types";

export const DEFAULT_ARCHITECTURE_CATEGORY_SLUGS = [
  "konut-projeleri",
  "fabrika-projeleri",
  "villa-projeleri"
] as const;

export const defaultArchitectureCategories: ArchitectureCategory[] = [
  {
    id: "arc-cat-konut",
    titleTr: "Konut Projeleri",
    titleEn: "Residential Projects",
    slug: "konut-projeleri",
    descriptionTr: "Modern yaşam ihtiyaçlarına uygun, estetik ve fonksiyonel konut mimarisi çözümleri.",
    descriptionEn: "Aesthetic and functional residential architecture solutions for modern living needs.",
    coverImageUrl: "/images/architecture/project-placeholder-1.svg",
    active: true,
    sortOrder: 1
  },
  {
    id: "arc-cat-fabrika",
    titleTr: "Fabrika Projeleri",
    titleEn: "Factory Projects",
    slug: "fabrika-projeleri",
    descriptionTr: "Üretim süreçlerine uygun, verimli ve sürdürülebilir endüstriyel yapı tasarımları.",
    descriptionEn: "Efficient and sustainable industrial facility designs tailored to production workflows.",
    coverImageUrl: "/images/architecture/project-placeholder-1.svg",
    active: true,
    sortOrder: 2
  },
  {
    id: "arc-cat-villa",
    titleTr: "Villa Projeleri",
    titleEn: "Villa Projects",
    slug: "villa-projeleri",
    descriptionTr: "Özgün mimari diliyle kişiselleştirilmiş, yüksek standartlı villa tasarım projeleri.",
    descriptionEn: "High-standard, personalized villa design projects with a distinctive architectural language.",
    coverImageUrl: "/images/architecture/project-placeholder-1.svg",
    active: true,
    sortOrder: 3
  }
];

export const defaultArchitectureProjects: ArchitectureProject[] = [
  {
    id: "arc-prj-konut-001",
    categoryId: "arc-cat-konut",
    titleTr: "Teras Dubleks Konut Projesi",
    titleEn: "Terrace Duplex Housing Project",
    slug: "teras-dubleks-projesi",
    shortDescriptionTr: "Çok katlı konut konseptinde çağdaş cephe ve verimli planlama yaklaşımı.",
    shortDescriptionEn: "Contemporary facade and efficient spatial planning for a multi-level housing concept.",
    detailedDescriptionTr:
      "Konut projesinde yaşam kalitesini artıran doğal ışık, kullanıcı sirkülasyonu ve fonksiyonel hacim kullanımı temel alınmıştır.",
    detailedDescriptionEn:
      "The project focuses on quality of life through natural light, user circulation, and functional volume planning.",
    subtitleTr: "Modern konut yaklaşımı",
    subtitleEn: "Modern residential approach",
    coverImageUrl: "/images/architecture/project-placeholder-1.svg",
    galleryImageUrls: ["/images/architecture/project-placeholder-1.svg"],
    locationTr: "Ankara",
    locationEn: "Ankara",
    statusTr: "Tamamlandı",
    statusEn: "Completed",
    year: "2025",
    active: true,
    featured: true,
    sortOrder: 1
  },
  {
    id: "arc-prj-fabrika-001",
    categoryId: "arc-cat-fabrika",
    titleTr: "Endüstriyel Üretim Tesisi",
    titleEn: "Industrial Production Facility",
    slug: "endustriyel-uretim-tesisi",
    shortDescriptionTr: "Operasyon verimliliğini destekleyen modüler endüstriyel mimari çözüm.",
    shortDescriptionEn: "A modular industrial architecture solution supporting operational efficiency.",
    detailedDescriptionTr:
      "Fabrika projesinde lojistik akış, servis erişimi ve üretim bandı organizasyonu birlikte ele alınmıştır.",
    detailedDescriptionEn:
      "The factory project combines logistics flow, service access, and production-line organization.",
    subtitleTr: "Yüksek verimli sanayi mimarisi",
    subtitleEn: "High-efficiency industrial architecture",
    coverImageUrl: "/images/architecture/project-placeholder-1.svg",
    galleryImageUrls: ["/images/architecture/project-placeholder-1.svg"],
    locationTr: "Kocaeli",
    locationEn: "Kocaeli",
    statusTr: "Devam Ediyor",
    statusEn: "Ongoing",
    year: "2026",
    active: true,
    featured: false,
    sortOrder: 1
  },
  {
    id: "arc-prj-villa-001",
    categoryId: "arc-cat-villa",
    titleTr: "Özel Villa Tasarımı",
    titleEn: "Private Villa Design",
    slug: "ozel-villa-tasarimi",
    shortDescriptionTr: "Doğayla uyumlu, prestijli ve kullanıcı odaklı villa mimarisi.",
    shortDescriptionEn: "Nature-integrated, prestigious, and user-focused villa architecture.",
    detailedDescriptionTr:
      "Villa projesi; mahremiyet, açık alan kullanımı ve yüksek malzeme standardı üzerinden kurgulanmıştır.",
    detailedDescriptionEn:
      "The villa project is designed around privacy, open-space use, and high material standards.",
    subtitleTr: "Prestijli yaşam alanı",
    subtitleEn: "Prestige living space",
    coverImageUrl: "/images/architecture/project-placeholder-1.svg",
    galleryImageUrls: ["/images/architecture/project-placeholder-1.svg"],
    locationTr: "İzmir",
    locationEn: "Izmir",
    statusTr: "Planlandı",
    statusEn: "Planned",
    year: "2026",
    active: true,
    featured: false,
    sortOrder: 1
  }
];
