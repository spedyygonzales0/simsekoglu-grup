import { defaultFleetVehicles } from "@/lib/data/fleet-vehicle-catalog";
import { defaultFleetInformation } from "@/lib/data/fleet-information-default";
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
    descriptionTr: `Şimşekoğlu Grup, temellerini uzun yıllara dayanan tecrübe, güven ve kalite anlayışı üzerine inşa etmiş köklü bir kuruluştur. İnşaat sektöründe edindiği güçlü birikimle faaliyetlerine başlayan firmamız, bugüne kadar birçok projede sağlamlığı, sürdürülebilirliği ve estetik yaklaşımı bir araya getirerek sektörde güvenilir bir marka haline gelmiştir.

Zaman içerisinde gelişen ihtiyaçlar ve değişen sektör dinamikleri doğrultusunda kendini sürekli yenileyen Şimşekoğlu Grup, faaliyet alanını genişleterek mimarlık ve proje geliştirme hizmetleri ile müşterilerine uçtan uca çözümler sunmaya başlamıştır. Modern tasarım anlayışı, fonksiyonel çözümler ve mühendislik disiplinini bir araya getiren yaklaşımımız sayesinde, her projede kaliteyi ve müşteri memnuniyetini ön planda tutmaktayız.

Bugün ise Şimşekoğlu Grup, sahip olduğu kurumsal vizyon doğrultusunda hizmet yelpazesini daha da genişleterek kurumsal araç kiralama ve filo yönetimi alanında da faaliyet göstermektedir. İş dünyasının ihtiyaçlarına özel olarak geliştirdiğimiz çözümlerle, müşterilerimize güvenilir, ekonomik ve sürdürülebilir ulaşım hizmetleri sunuyoruz.

Faaliyet gösterdiğimiz her alanda ortak hedefimiz; güvenilirlik, şeffaflık, kalite ve sürdürülebilir değer üretimidir.

Şimşekoğlu Grup olarak, iş ortaklarımızla uzun vadeli ilişkiler kurmayı, müşterilerimizin ihtiyaçlarını doğru analiz ederek en uygun çözümleri sunmayı ve her zaman sözümüzün arkasında durmayı ilke edindik.

Geçmişten aldığımız güç, bugün sunduğumuz hizmet kalitesi ve geleceğe yönelik vizyonumuz ile; Şimşekoğlu Grup, her projede güvenin ve profesyonelliğin temsilcisidir.`,
    descriptionEn: `Şimşekoğlu Group is a well-established organization built on years of experience, trust, and a strong commitment to quality. Having started its journey in the construction sector, our company has successfully delivered numerous projects by combining durability, sustainability, and aesthetic excellence, earning a reputation as a reliable and respected brand.

In line with evolving industry dynamics and changing customer needs, Şimşekoğlu Group has continuously developed its capabilities and expanded its scope of services. By incorporating architectural design and project development services, we now provide end-to-end solutions that integrate modern design principles, functional efficiency, and engineering excellence. In every project we undertake, we prioritize quality and customer satisfaction.

Today, guided by our corporate vision, Şimşekoğlu Group has further diversified its operations by offering corporate vehicle rental and fleet management services. With tailored solutions designed to meet the needs of businesses, we provide reliable, cost-effective, and sustainable mobility services.

Across all our areas of operation, our core principles remain unchanged: reliability, transparency, quality, and sustainable value creation.

At Şimşekoğlu Group, we are committed to building long-term partnerships, accurately understanding our clients’ needs, and delivering the most effective solutions while always standing behind our promises.

With the strength we draw from our past, the quality of services we deliver today, and our forward-looking vision, Şimşekoğlu Group stands as a symbol of trust and professionalism in every project.`,
    videoUrl: "/images/hakkımızda/TANITIM.mp4",
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
    whatsappGeneral: "905446564000",
    whatsappFleet: "905333603627",
    whatsappConstruction: "905446564000",
    whatsappArchitecture: "",
    whatsapp: "905446564000",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1291.7876590941064!2d32.610087211323965!3d40.066781855509205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d3338ec7768c3f%3A0xa6b18625d699dbd8!2zxZ7EsE3FnkVLT8SeTFUgT1RPTU9UxLBWIEbEsExP!5e1!3m2!1str!2str!4v1777455274447!5m2!1str!2str",
    mapLinkUrl: "https://maps.app.goo.gl/TdHCzQVZe4N8qLrV9",
    social: {
      instagram: "@simsekoglufilo"
    }
  },
  vehicles: defaultFleetVehicles,
  fleetInformation: defaultFleetInformation,
  projectCardTexts: {
    construction: {},
    architecture: {}
  },
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


