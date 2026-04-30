import { IMAGE_FOLDERS } from "@/lib/data/image-map";
import { fleetMediaManifest } from "@/lib/data/fleet-media-manifest";
import { Vehicle, VehicleCategory } from "@/lib/types";

interface VehicleSeed {
  id: string;
  brand: string;
  model: string;
  slug: string;
  image: string;
  modelYearLabel: string;
  primaryCategory: VehicleCategory;
  secondaryCategories: VehicleCategory[];
  infoTr?: string;
  infoEn?: string;
  officialUrl?: string;
  featured?: boolean;
}

const VEHICLE_INFO_BY_SLUG: Record<string, { tr: string; en: string }> = {
  "renault-megane": {
    tr: "Şık tasarımı, konforlu sürüşü ve yakıt verimliliği ile öne çıkan kompakt bir otomobildir. Günlük kullanım için ideal, modern ve kullanıcı dostudur.",
    en: "A compact car known for its stylish design, comfort, and fuel efficiency. Ideal for everyday use with a modern and user-friendly structure."
  },
  "bmw-i5-edrive40": {
    tr: "Tamamen elektrikli lüks sedan olup güçlü performansı ve uzun menziliyle konforlu, sessiz ve premium bir sürüş sunar.",
    en: "A fully electric luxury sedan offering strong performance, long range, and a quiet, premium driving experience."
  },
  "bmw-i7-xdrive60": {
    tr: "Üst düzey konfor ve teknoloji sunan elektrikli amiral gemisi sedan modelidir. Geniş iç mekan ve yüksek performans sunar.",
    en: "A flagship electric luxury sedan delivering top-level comfort, advanced technology, and strong performance."
  },
  "togg-t10f": {
    tr: "Modern tasarıma sahip tamamen elektrikli fastback sedan modelidir. Uzun menzil ve gelişmiş dijital özellikler sunar.",
    en: "A fully electric fastback sedan with modern design, long range, and advanced digital features."
  },
  "peugeot-2008": {
    tr: "Kompakt SUV yapısı, yüksek sürüş pozisyonu ve pratik kullanımıyla şehir içi için ideal bir araçtır.",
    en: "A compact SUV with an elevated driving position and practical design, ideal for urban use."
  },
  "peugeot-3008": {
    tr: "Modern tasarımı ve yüksek konfor seviyesiyle öne çıkan kompakt SUV modelidir.",
    en: "A compact SUV known for its modern design and high comfort level."
  },
  "bmw-3-serisi": {
    tr: "Sportif sürüş ve konforu bir araya getiren premium sedan modelidir.",
    en: "A premium sedan combining sporty driving dynamics with comfort."
  },
  "bmw-5-serisi": {
    tr: "Lüks ve performansı bir araya getiren geniş ve prestijli bir sedan modelidir.",
    en: "An executive sedan offering luxury, space, and strong performance."
  },
  "audi-a4": {
    tr: "Zarif tasarımı ve dengeli sürüşüyle öne çıkan premium sedan modelidir.",
    en: "A premium sedan known for its elegant design and balanced driving experience."
  },
  "audi-a6": {
    tr: "Geniş iç hacmi ve ileri teknolojileriyle üst segment bir sedan modelidir.",
    en: "An executive sedan with a spacious interior and advanced technology."
  },
  "hyundai-bayon": {
    tr: "Şehir içi kullanım için ideal kompakt SUV modelidir. Ekonomik ve pratiktir.",
    en: "A compact SUV designed for city driving, offering efficiency and practicality."
  },
  "citroen-berlingo": {
    tr: "Geniş iç hacimli, hem iş hem aile kullanımına uygun hafif ticari araçtır.",
    en: "A versatile light commercial vehicle suitable for both business and family use."
  },
  "citroen-c5-aircross": {
    tr: "Yumuşak sürüşü ve yüksek konforu ile öne çıkan SUV modelidir.",
    en: "A compact SUV known for its comfort and smooth driving experience."
  },
  "mercedes-cla": {
    tr: "Sportif coupe tasarıma sahip kompakt lüks sedan modelidir.",
    en: "A compact luxury sedan with a sporty coupe-inspired design."
  },
  "renault-clio": {
    tr: "Ekonomik, kompakt ve şehir içi kullanım için ideal hatchback modelidir.",
    en: "A compact hatchback known for its efficiency and suitability for city driving."
  },
  "opel-combo": {
    tr: "Geniş yükleme alanı sunan pratik bir hafif ticari araçtır.",
    en: "A practical light commercial vehicle with a spacious cargo area."
  },
  "toyota-corolla": {
    tr: "Dayanıklılığı ve düşük yakıt tüketimi ile öne çıkan sedan modelidir.",
    en: "A reliable sedan known for fuel efficiency and durability."
  },
  "mercedes-c-serisi": {
    tr: "Lüks ve modern teknolojiyi birleştiren premium sedan modelidir.",
    en: "A premium sedan combining luxury with modern technology."
  },
  "cupra-formentor": {
    tr: "Sportif sürüş sunan performans odaklı crossover SUV modelidir.",
    en: "A performance-oriented crossover SUV with sporty driving dynamics."
  },
  "fiat-doblo": {
    tr: "Dayanıklı yapısı ve geniş iç hacmiyle öne çıkan ticari araçtır.",
    en: "A durable light commercial vehicle with a spacious interior."
  },
  "citroen-e-c3": {
    tr: "Şehir içi için uygun tamamen elektrikli hatchback modelidir.",
    en: "A fully electric hatchback designed for urban driving."
  },
  "mercedes-eqb": {
    tr: "7 koltuk opsiyonlu elektrikli SUV modelidir.",
    en: "An electric SUV offering optional 7-seat capacity."
  },
  "mercedes-eqe": {
    tr: "Üst düzey konfor sunan elektrikli sedan modelidir.",
    en: "An electric executive sedan with high comfort and advanced tech."
  },
  "mercedes-e-serisi": {
    tr: "Konfor ve prestiji bir araya getiren üst segment sedan modelidir.",
    en: "An executive sedan combining comfort and prestige."
  },
  "kia-ev3": {
    tr: "Modern tasarımlı kompakt elektrikli SUV modelidir.",
    en: "A compact electric SUV with a modern design."
  },
  "volvo-ex30": {
    tr: "Kompakt ve sürdürülebilir yapıya sahip elektrikli SUV modelidir.",
    en: "A compact electric SUV focused on sustainability and safety."
  },
  "ford-focus": {
    tr: "Dengeli sürüş ve iyi yol tutuş sunan kompakt otomobildir.",
    en: "A compact car known for balanced driving and good handling."
  },
  "hyundai-i20": {
    tr: "Ekonomik ve şehir içi kullanım için uygun hatchback modelidir.",
    en: "A fuel-efficient hatchback ideal for city driving."
  },
  "hyundai-ioniq-6": {
    tr: "Aerodinamik tasarıma sahip elektrikli sedan modelidir.",
    en: "An aerodynamic fully electric sedan with long range."
  },
  "bmw-ix2": {
    tr: "Sportif tasarımlı elektrikli coupe SUV modelidir.",
    en: "A sporty electric coupe-style SUV."
  },
  "renault-megane-e-tech": {
    tr: "Elektrikli ve modern tasarımlı kompakt hatchback modelidir.",
    en: "A modern fully electric compact hatchback."
  },
  "opel-mokka": {
    tr: "Kompakt yapılı modern crossover SUV modelidir.",
    en: "A compact crossover SUV with modern styling."
  },
  "skoda-octavia": {
    tr: "Geniş iç hacmi ve büyük bagajıyla öne çıkan sedan modelidir.",
    en: "A spacious sedan with a large trunk and practical design."
  },
  "chery-omoda-5": {
    tr: "Futuristik tasarıma sahip kompakt SUV modelidir.",
    en: "A futuristic compact SUV with modern technology."
  },
  "peugeot-partner": {
    tr: "İş ve günlük kullanım için uygun hafif ticari araçtır.",
    en: "A practical light commercial vehicle for business and daily use."
  },
  "toyota-proace-city": {
    tr: "Geniş ve dayanıklı yapıya sahip ticari araçtır.",
    en: "A durable light commercial vehicle with a spacious interior."
  },
  "dacia-sandero": {
    tr: "Uygun fiyatlı ve ekonomik hatchback modelidir.",
    en: "An affordable and efficient hatchback."
  },
  "togg-t10x": {
    tr: "Türkiye’nin yerli elektrikli SUV modelidir.",
    en: "Türkiye’s fully electric SUV model."
  },
  "volkswagen-taigo": {
    tr: "Coupe tarzı kompakt SUV modelidir.",
    en: "A coupe-style compact SUV."
  },
  "volkswagen-t-cross": {
    tr: "Şehir içi kullanım için uygun kompakt SUV modelidir.",
    en: "A compact SUV designed for urban use."
  },
  "tesla-model-y": {
    tr: "Uzun menzilli ve yüksek performanslı elektrikli SUV modelidir.",
    en: "A long-range, high-performance electric SUV."
  },
  "chery-tiggo-7-pro": {
    tr: "Modern ve donanımlı kompakt SUV modelidir.",
    en: "A well-equipped compact SUV with modern features."
  },
  "chery-tiggo-8-pro": {
    tr: "7 koltuklu geniş SUV modelidir.",
    en: "A spacious 7-seat SUV."
  },
  "ford-transit": {
    tr: "Yüksek taşıma kapasiteli büyük ticari araçtır.",
    en: "A large commercial vehicle with high cargo capacity."
  },
  "ford-transit-courier": {
    tr: "Kompakt ve ekonomik hafif ticari araçtır.",
    en: "A compact and efficient light commercial vehicle."
  },
  "volkswagen-t-roc": {
    tr: "Sportif tasarımlı kompakt SUV modelidir.",
    en: "A sporty compact SUV."
  },
  "volvo-xc90": {
    tr: "Lüks ve güvenlik odaklı 7 koltuklu SUV modelidir.",
    en: "A luxury 7-seat SUV focused on safety and comfort."
  }
};

function normalizeLookup(value: string): string {
  return value
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getFleetImagesBySeed(seed: VehicleSeed): { mainImage: string; galleryImages: string[] } {
  const fallbackImage = `${IMAGE_FOLDERS.fleet}/vehicle-placeholder.svg`;
  const folderCandidates = [
    `${seed.brand} ${seed.model}`,
    seed.model,
    seed.slug.replace(/-/g, " ")
  ]
    .map(normalizeLookup)
    .filter(Boolean);

  const matchedCandidates = fleetMediaManifest.filter((entry) => folderCandidates.includes(entry.normalizedFolder));
  const matched =
    matchedCandidates.find((entry) => entry.images.some((imagePath) => imagePath.includes("/images/fleet/aracresimleri/"))) ||
    matchedCandidates[0];
  if (!matched || !matched.images.length) {
    return {
      mainImage: fallbackImage,
      galleryImages: [fallbackImage]
    };
  }
  const galleryImages = Array.from(new Set(matched.images));
  return {
    mainImage: galleryImages[0] || fallbackImage,
    galleryImages: galleryImages.length ? galleryImages : [fallbackImage]
  };
}

function createVehicle(seed: VehicleSeed): Vehicle {
  const { mainImage, galleryImages } = getFleetImagesBySeed(seed);
  const fallbackInfo = VEHICLE_INFO_BY_SLUG[seed.slug];
  return {
    id: seed.id,
    brand: seed.brand,
    model: seed.model,
    modelYearLabel: seed.modelYearLabel,
    slug: seed.slug,
    primaryCategory: seed.primaryCategory,
    secondaryCategories: seed.secondaryCategories,
    infoTr: seed.infoTr || fallbackInfo?.tr || "",
    infoEn: seed.infoEn || fallbackInfo?.en || "",
    servicesText: "",
    termsText: "",
    userRulesText: "",
    officialUrl: seed.officialUrl || "",
    mainImage,
    galleryImages,
    carouselActive: galleryImages.length > 1,
    carouselSpeed: "normal",
    featured: Boolean(seed.featured),
    active: true,
    rentalPackages: []
  };
}

const fleetVehicleSeeds: VehicleSeed[] = [
  {
    id: "v-fiat-egea",
    brand: "Fiat",
    model: "Egea",
    slug: "fiat-egea",
    image: "egea.png",
    modelYearLabel: "2024+",
    primaryCategory: "economy",
    secondaryCategories: ["sedan"],
    infoTr: "Fiat Egea, kurumsal filo kullanımında düşük işletme maliyeti ve yüksek erişilebilirlik sunan ekonomik sedan modelidir.",
    infoEn: "Fiat Egea is an economy sedan for corporate fleets with low operating cost and broad service accessibility.",
    officialUrl: "https://www.fiat.com.tr/egea",
    featured: true
  },
  {
    id: "v-renault-megane",
    brand: "Renault",
    model: "Megane",
    slug: "renault-megane",
    image: "megane.png",
    modelYearLabel: "2024+",
    primaryCategory: "sedan",
    secondaryCategories: ["economy"],
    featured: true
  },
  { id: "v-peugeot-2008", brand: "Peugeot", model: "2008", slug: "peugeot-2008", image: "2008.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["economy"] },
  { id: "v-peugeot-3008", brand: "Peugeot", model: "3008", slug: "peugeot-3008", image: "3008.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["luxury"] },
  { id: "v-bmw-3", brand: "BMW", model: "3 Serisi", slug: "bmw-3-serisi", image: "3serisi.png", modelYearLabel: "2024+", primaryCategory: "luxury", secondaryCategories: ["sedan"] },
  { id: "v-bmw-5", brand: "BMW", model: "5 Serisi", slug: "bmw-5-serisi", image: "5serisi.png", modelYearLabel: "2024+", primaryCategory: "luxury", secondaryCategories: ["sedan"] },
  { id: "v-audi-a4", brand: "Audi", model: "A4", slug: "audi-a4", image: "a4.png", modelYearLabel: "2024+", primaryCategory: "luxury", secondaryCategories: ["sedan"] },
  { id: "v-audi-a6", brand: "Audi", model: "A6", slug: "audi-a6", image: "a6.png", modelYearLabel: "2024+", primaryCategory: "luxury", secondaryCategories: ["sedan"] },
  { id: "v-hyundai-bayon", brand: "Hyundai", model: "Bayon", slug: "hyundai-bayon", image: "bayon.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["economy"] },
  { id: "v-citroen-berlingo", brand: "Citroen", model: "Berlingo", slug: "citroen-berlingo", image: "berlingo.png", modelYearLabel: "2024+", primaryCategory: "commercial", secondaryCategories: ["van"] },
  { id: "v-citroen-c5", brand: "Citroen", model: "C5 Aircross", slug: "citroen-c5-aircross", image: "c5.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["luxury"] },
  { id: "v-mercedes-cla", brand: "Mercedes-Benz", model: "CLA", slug: "mercedes-cla", image: "cla.png", modelYearLabel: "2024+", primaryCategory: "luxury", secondaryCategories: ["sedan"] },
  { id: "v-renault-clio", brand: "Renault", model: "Clio", slug: "renault-clio", image: "clio.png", modelYearLabel: "2024+", primaryCategory: "economy", secondaryCategories: ["hatchback"] },
  { id: "v-opel-combo", brand: "Opel", model: "Combo", slug: "opel-combo", image: "combo.png", modelYearLabel: "2024+", primaryCategory: "commercial", secondaryCategories: ["van"] },
  { id: "v-toyota-corolla", brand: "Toyota", model: "Corolla", slug: "toyota-corolla", image: "corolla.png", modelYearLabel: "2024+", primaryCategory: "economy", secondaryCategories: ["sedan"] },
  { id: "v-toyota-corolla-cross", brand: "Toyota", model: "Corolla Cross", slug: "toyota-corolla-cross", image: "cross.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["economy"] },
  { id: "v-mercedes-c", brand: "Mercedes-Benz", model: "C Serisi", slug: "mercedes-c-serisi", image: "cserisi.png", modelYearLabel: "2024+", primaryCategory: "luxury", secondaryCategories: ["sedan"] },
  { id: "v-cupra-formentor", brand: "Cupra", model: "Formentor", slug: "cupra-formentor", image: "cupra.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["luxury"] },
  { id: "v-fiat-doblo", brand: "Fiat", model: "Doblo", slug: "fiat-doblo", image: "doblo.png", modelYearLabel: "2024+", primaryCategory: "commercial", secondaryCategories: ["van"] },
  { id: "v-citroen-ec3", brand: "Citroen", model: "e-C3", slug: "citroen-e-c3", image: "ec3.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["hatchback", "economy"] },
  { id: "v-mercedes-eqb", brand: "Mercedes-Benz", model: "EQB", slug: "mercedes-eqb", image: "eqb.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["suv", "luxury"] },
  { id: "v-mercedes-eqe", brand: "Mercedes-Benz", model: "EQE", slug: "mercedes-eqe", image: "eqe.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["luxury", "sedan"] },
  { id: "v-mercedes-e", brand: "Mercedes-Benz", model: "E Serisi", slug: "mercedes-e-serisi", image: "eserisi.png", modelYearLabel: "2024+", primaryCategory: "luxury", secondaryCategories: ["sedan"] },
  { id: "v-kia-ev3", brand: "Kia", model: "EV3", slug: "kia-ev3", image: "ev3.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["suv"] },
  { id: "v-volvo-ex30", brand: "Volvo", model: "EX30", slug: "volvo-ex30", image: "exc30.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["suv", "luxury"] },
  { id: "v-ford-focus", brand: "Ford", model: "Focus", slug: "ford-focus", image: "focus.png", modelYearLabel: "2024+", primaryCategory: "economy", secondaryCategories: ["hatchback"] },
  { id: "v-hyundai-i20", brand: "Hyundai", model: "i20", slug: "hyundai-i20", image: "i20.png", modelYearLabel: "2024+", primaryCategory: "economy", secondaryCategories: ["hatchback"] },
  { id: "v-bmw-i5", brand: "BMW", model: "i5 eDrive40", slug: "bmw-i5-edrive40", image: "i5.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["luxury", "sedan"], featured: true },
  { id: "v-bmw-i7", brand: "BMW", model: "i7 xDrive60", slug: "bmw-i7-xdrive60", image: "i7.png", modelYearLabel: "2024+", primaryCategory: "luxury", secondaryCategories: ["electric", "sedan"] },
  { id: "v-hyundai-ioniq6", brand: "Hyundai", model: "Ioniq 6", slug: "hyundai-ioniq-6", image: "iqonik6.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["sedan"] },
  { id: "v-bmw-ix2", brand: "BMW", model: "iX2", slug: "bmw-ix2", image: "ix2.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["suv", "luxury"] },
  { id: "v-renault-megane-e", brand: "Renault", model: "Megane E-Tech", slug: "renault-megane-e-tech", image: "meganee.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["hatchback"] },
  { id: "v-opel-mokka", brand: "Opel", model: "Mokka", slug: "opel-mokka", image: "mokka.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["economy"] },
  { id: "v-skoda-octavia", brand: "Skoda", model: "Octavia", slug: "skoda-octavia", image: "octavia.png", modelYearLabel: "2024+", primaryCategory: "sedan", secondaryCategories: ["economy"] },
  { id: "v-chery-omoda5", brand: "Chery", model: "Omoda 5", slug: "chery-omoda-5", image: "omada.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["economy"] },
  { id: "v-peugeot-partner", brand: "Peugeot", model: "Partner", slug: "peugeot-partner", image: "partner.png", modelYearLabel: "2024+", primaryCategory: "commercial", secondaryCategories: ["van"] },
  { id: "v-toyota-proace", brand: "Toyota", model: "Proace City", slug: "toyota-proace-city", image: "proace.png", modelYearLabel: "2024+", primaryCategory: "commercial", secondaryCategories: ["van"] },
  { id: "v-dacia-sandero", brand: "Dacia", model: "Sandero", slug: "dacia-sandero", image: "sandero.png", modelYearLabel: "2024+", primaryCategory: "economy", secondaryCategories: ["hatchback"] },
  { id: "v-togg-t10f", brand: "TOGG", model: "T10F", slug: "togg-t10f", image: "t10f.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["luxury", "sedan"] },
  { id: "v-togg-t10x", brand: "TOGG", model: "T10X", slug: "togg-t10x", image: "t10x.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["suv", "luxury"], featured: true },
  { id: "v-vw-taigo", brand: "Volkswagen", model: "Taigo", slug: "volkswagen-taigo", image: "taigo.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["economy"] },
  { id: "v-vw-tcross", brand: "Volkswagen", model: "T-Cross", slug: "volkswagen-t-cross", image: "tcross.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["economy"] },
  { id: "v-tesla-modely", brand: "Tesla", model: "Model Y", slug: "tesla-model-y", image: "tesla.png", modelYearLabel: "2024+", primaryCategory: "electric", secondaryCategories: ["suv", "luxury"] },
  { id: "v-chery-tiggo7", brand: "Chery", model: "Tiggo 7 Pro", slug: "chery-tiggo-7-pro", image: "tiggo7.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["luxury"] },
  { id: "v-chery-tiggo8", brand: "Chery", model: "Tiggo 8 Pro", slug: "chery-tiggo-8-pro", image: "tiggo8.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["luxury"] },
  { id: "v-ford-transit", brand: "Ford", model: "Transit", slug: "ford-transit", image: "transit.png", modelYearLabel: "2024+", primaryCategory: "commercial", secondaryCategories: ["van"] },
  { id: "v-ford-transit-courier", brand: "Ford", model: "Transit Courier", slug: "ford-transit-courier", image: "transitt.png", modelYearLabel: "2024+", primaryCategory: "commercial", secondaryCategories: ["van"] },
  { id: "v-vw-troc", brand: "Volkswagen", model: "T-Roc", slug: "volkswagen-t-roc", image: "troc.png", modelYearLabel: "2024+", primaryCategory: "suv", secondaryCategories: ["economy"] },
  { id: "v-volvo-xc90", brand: "Volvo", model: "XC90", slug: "volvo-xc90", image: "xc90.png", modelYearLabel: "2024+", primaryCategory: "luxury", secondaryCategories: ["suv"] }
];

export const defaultFleetVehicles: Vehicle[] = fleetVehicleSeeds.map(createVehicle);

export function getFleetMediaBySlug(slug: string): { mainImage: string; galleryImages: string[] } | null {
  const vehicle = defaultFleetVehicles.find((item) => item.slug === slug);
  if (!vehicle) return null;
  return {
    mainImage: vehicle.mainImage,
    galleryImages: [...(vehicle.galleryImages || [vehicle.mainImage])]
  };
}
