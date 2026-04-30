import { IncludedServiceItem } from "@/lib/types";

// Global included services. Ready to be moved into admin-managed content later.
export const fleetIncludedServices: IncludedServiceItem[] = [
  {
    id: "maintenance-repair",
    icon: "BO",
    titleTr: "Bakım Onarım",
    titleEn: "Maintenance & Repair",
    descriptionTr:
      "Tüm bakım ve onarım işlemleri anlaşmalı servislerimiz tarafından yapılır.",
    descriptionEn:
      "All maintenance and repair operations are performed by our contracted service network."
  },
  {
    id: "tire",
    icon: "LT",
    titleTr: "Lastik",
    titleEn: "Tire",
    descriptionTr:
      "Yazlık ve kışlık lastik değişimi ile periyodik lastik yönetimi operasyon kapsamında yürütülür.",
    descriptionEn:
      "Summer/winter tire replacement and periodic tire management are handled within the operation package."
  },
  {
    id: "roadside",
    icon: "YY",
    titleTr: "Yol Yardım",
    titleEn: "Roadside Assistance",
    descriptionTr:
      "Araçlarınızla karşılaşabileceğiniz acil durumlarda yol yardım hizmetimize 7/24 ulaşabilirsiniz.",
    descriptionEn:
      "You can access our 24/7 roadside assistance in emergencies during operation."
  },
  {
    id: "vehicle-tracking",
    icon: "AT",
    titleTr: "Araç Takibi",
    titleEn: "Vehicle Tracking",
    descriptionTr:
      "Uygulama üzerinden araç kullanımına yönelik temel operasyonel takip desteği sunulur.",
    descriptionEn:
      "Basic operational monitoring support is provided via the fleet application infrastructure."
  },
  {
    id: "damage-management",
    icon: "HY",
    titleTr: "Hasar Yönetimi",
    titleEn: "Damage Management",
    descriptionTr:
      "Kaza veya hasar durumlarında anlaşmalı servis ağımızla yönlendirme ve takip desteği verilir.",
    descriptionEn:
      "In case of accident or damage, our contracted service network provides guidance and follow-up support."
  },
  {
    id: "replacement-vehicle",
    icon: "IA",
    titleTr: "İkame Araç",
    titleEn: "Replacement Vehicle",
    descriptionTr:
      "Sözleşme kapsamındaki uygun durumlarda ikame araç desteği sağlanabilir.",
    descriptionEn:
      "A replacement vehicle can be provided in eligible cases according to contract scope."
  },
  {
    id: "tax-management",
    icon: "VY",
    titleTr: "Vergi Yönetimi",
    titleEn: "Tax Management",
    descriptionTr:
      "Aracınıza ait MTV ve ilgili yasal süreçler sözleşme kapsamına göre operasyonel olarak takip edilir.",
    descriptionEn:
      "Vehicle tax and relevant legal processes are operationally followed according to contract scope."
  }
];
