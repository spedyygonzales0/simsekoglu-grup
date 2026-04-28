import { defaultFleetVehicles } from "@/lib/data/fleet-vehicle-catalog";
import { CATEGORY_DEFAULT_MEDIA, IMAGE_FOLDERS } from "@/lib/data/image-map";
import { SiteContent } from "@/lib/types";

export const defaultSiteContent: SiteContent = {
  home: {
    headlineTr: "Şimşekoğlu Grup ile Güçlü Yapılar ve Prestijli Filo Çözümleri",
    headlineEn: "Strong Structures and Prestige Fleet Solutions with Simsekoglu Group",
    subHeadlineTr:
      "İnşaat, mimarlık ve kurumsal araç kiralama alanlarında disiplinli ve sürdürülebilir hizmet sunuyoruz.",
    subHeadlineEn:
      "We deliver disciplined and sustainable services in construction, architecture, and corporate fleet rental.",
    ctaTr: "Teklif Al",
    ctaEn: "Get a Quote",
    serviceTitleTr: "Kurumsal Hizmet Alanlarımız",
    serviceTitleEn: "Our Corporate Service Areas",
    serviceDescriptionTr:
      "Farklı sektör ihtiyaçlarını tek çatı altında, yüksek kalite ve şeffaf süreç yönetimi ile karşılıyoruz.",
    serviceDescriptionEn:
      "We address cross-sector needs under one roof with high quality and transparent process management."
  },
  about: {
    titleTr: "Şimşekoğlu Grup: Güven ve Operasyonel Mükemmeliyet",
    titleEn: "Simsekoglu Group: Trust and Operational Excellence",
    descriptionTr:
      "Şimşekoğlu Grup, büyük ölçekli projelerde planlama, uygulama ve saha yönetimini bütüncül bir yaklaşımla yürütür.",
    descriptionEn:
      "Simsekoglu Group executes planning, implementation, and field operations with a holistic approach in large-scale projects.",
    valuesTitleTr: "Temel Değerlerimiz",
    valuesTitleEn: "Our Core Values"
  },
  construction: {
    titleTr: "Her Ölçekte İnşaat Projeleri",
    titleEn: "Construction Projects at Every Scale",
    descriptionTr:
      "Konut, ticari, renovasyon ve anahtar teslim projelerde kalite, zaman ve bütçe odaklı yönetim sunuyoruz.",
    descriptionEn:
      "We provide quality, time, and budget focused management across residential, commercial, renovation, and turnkey projects.",
    residentialTr: "Konut projelerinde güvenli ve yüksek standartlı uygulama.",
    residentialEn: "Safe and high-standard execution for residential developments.",
    commercialTr: "Ticari yapılarda fonksiyonel ve verimli proje yönetimi.",
    commercialEn: "Functional and efficient project management for commercial buildings.",
    renovationTr: "Mevcut yapılarda güçlendirme ve modernizasyon çözümleri.",
    renovationEn: "Strengthening and modernization solutions for existing structures.",
    turnkeyTr: "Disiplinler arası koordinasyonla anahtar teslim proje teslimi.",
    turnkeyEn: "Turnkey delivery with interdisciplinary coordination."
  },
  architecture: {
    titleTr: "Kurumsal Mimari Çözümler",
    titleEn: "Corporate Architectural Solutions",
    descriptionTr:
      "İç mimarlık, dış mimarlık, proje çizimi ve konsept tasarım süreçlerinde işlev ve estetiği dengeliyoruz.",
    descriptionEn:
      "We balance function and aesthetics across interior, exterior, drawing, and concept design processes.",
    interiorTr: "İç mekanda kullanıcı deneyimi ve marka kimliği odaklı tasarım.",
    interiorEn: "Interior design focused on user experience and brand identity.",
    exteriorTr: "Dış cephede modern, kalıcı ve güçlü tasarım dili.",
    exteriorEn: "Modern, durable, and strong design language for facades.",
    drawingTr: "Teknik doğruluk ve disiplin uyumuyla proje çizimi.",
    drawingEn: "Project drawing with technical accuracy and discipline alignment.",
    conceptTr: "Yatırım hedeflerine uygun konsept üretimi.",
    conceptEn: "Concept development aligned with investment objectives."
  },
  contact: {
    phone: "+90 212 000 00 00",
    email: "info@simsekoglugrup.com",
    addressTr: "Levent Mah. Büyükdere Cad. No:00, Beşiktaş / İstanbul",
    addressEn: "Levent District, Buyukdere Ave. No:00, Besiktas / Istanbul",
    whatsapp: "905550000000",
    mapEmbedUrl: "https://maps.google.com",
    social: {
      instagram: "@simsekoglufilo"
    }
  },
  vehicles: defaultFleetVehicles,
  projects: [
    {
      id: "p-construction-1",
      titleTr: "Marmara Konut Kompleksi",
      titleEn: "Marmara Residential Complex",
      summaryTr: "Çok bloklu premium konut projesi.",
      summaryEn: "A multi-block premium residential project.",
      descriptionTr: "Konut yaşam kalitesini artıran modern ve güvenli yapılaşma projesi.",
      descriptionEn: "A modern and safe development project designed to improve residential quality.",
      locationTr: "İstanbul",
      locationEn: "Istanbul",
      date: "2025-09",
      status: "ongoing",
      category: "construction",
      imageUrl: CATEGORY_DEFAULT_MEDIA.construction.image,
      videoUrl: CATEGORY_DEFAULT_MEDIA.construction.video,
      featured: true
    },
    {
      id: "p-architecture-1",
      titleTr: "Kurumsal Merkez Ofis Tasarımı",
      titleEn: "Corporate HQ Office Design",
      summaryTr: "İç ve dış mimari yaklaşımı birleştiren merkez ofis projesi.",
      summaryEn: "A headquarters project combining interior and exterior architecture.",
      descriptionTr: "Marka kimliğini öne çıkaran çağdaş cephe ve işlevsel mekan planlaması.",
      descriptionEn: "Contemporary facade and functional spatial planning that highlights brand identity.",
      locationTr: "Ankara",
      locationEn: "Ankara",
      date: "2024-11",
      status: "completed",
      category: "architecture",
      imageUrl: CATEGORY_DEFAULT_MEDIA.architecture.image,
      videoUrl: CATEGORY_DEFAULT_MEDIA.architecture.video,
      featured: true
    },
    {
      id: "p-fleet-1",
      titleTr: "Yönetici Filo Dönüşüm Projesi",
      titleEn: "Executive Fleet Transformation",
      summaryTr: "Elektrikli araç odaklı kurumsal filo dönüşümü.",
      summaryEn: "Electric-focused corporate fleet transformation.",
      descriptionTr: "Yönetici segmentinde sürdürülebilir ve verimli filo planlaması.",
      descriptionEn: "Sustainable and efficient fleet planning for executive segments.",
      locationTr: "İzmir",
      locationEn: "Izmir",
      date: "2026-02",
      status: "planned",
      category: "fleet",
      imageUrl: `${IMAGE_FOLDERS.fleet}/filo.png`,
      videoUrl: `${IMAGE_FOLDERS.fleet}/filo-ana.png`,
      featured: false
    }
  ],
  mediaLibrary: [
    `${IMAGE_FOLDERS.general}/logo.png`,
    `${IMAGE_FOLDERS.general}/hero-placeholder.svg`,
    `${IMAGE_FOLDERS.general}/about-placeholder.svg`,
    `${IMAGE_FOLDERS.construction}/project-placeholder-1.svg`,
    `${IMAGE_FOLDERS.architecture}/project-placeholder-1.svg`,
    `${IMAGE_FOLDERS.fleet}/egea.png`
  ],
  settings: {
    maintenanceMode: false,
    contactEmail: "info@simsekoglugrup.com",
    currency: "TRY"
  }
};
