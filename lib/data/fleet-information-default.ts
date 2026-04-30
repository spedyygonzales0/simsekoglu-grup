import { FleetInformationContent } from "@/lib/types";
import { fleetIncludedServices } from "@/lib/data/fleet-included-services";

export const defaultFleetInformation: FleetInformationContent = {
  servicesText:
    "Kurumsal filo operasyonlarınız için araç yönetimi, hizmet koordinasyonu ve süreç takibini tek noktadan sunuyoruz.",
  termsText:
    "Kiralama süreçleri sözleşme koşullarına göre yürütülür. Operasyon kapsamı, kilometre paketi ve hizmet seviyeleri teklif aşamasında netleştirilir.",
  userRulesText:
    "Araçların sözleşme kapsamına uygun kullanımı, periyodik bakım takibi ve trafik kurallarına uyum kullanıcı sorumluluğundadır.",
  insurancePrivilegesTitleTr: "KASKO POLİÇESİ KAPSAMINDA FİYATA DAHİL OLAN AYRICALIKLARIMIZ",
  insurancePrivilegesTitleEn: "PRIVILEGES INCLUDED IN PRICE WITHIN CASCO POLICY",
  insurancePrivilegesTextTr: `Çekici Hizmeti: 50.000 TL'ye kadar
İkame Araç: Yılda 2 kez / 7 gün
Yol Yardım: Lastik değişimi, çilingir hizmeti
Konaklama / Ulaşım: Kaza durumunda sağlanan destek
Anahtar Kaybı: Kilit değiştirme teminatı`,
  insurancePrivilegesTextEn: `Tow Truck Service: up to 50,000 TRY
Replacement Vehicle: 2 times per year / 7 days
Roadside Assistance: tire replacement, locksmith support
Accommodation / Transportation: support in accident cases
Key Loss: lock replacement coverage`,
  whySimsekogluTitleTr: "NEDEN ŞİMŞEKOĞLU FİLO?",
  whySimsekogluTitleEn: "WHY ŞİMŞEKOĞLU FLEET?",
  whySimsekogluTextTr: `Şimşekoğlu Filo, uzun dönem araç kiralamada güvenilir, ekonomik ve sürdürülebilir çözümler sunar. Araç sahibi olmanın yüksek maliyetleri ve sorumluluklarıyla uğraşmadan, sabit aylık ödeme avantajıyla dilediğiniz araca sahip olabilirsiniz.

Sigorta, bakım ve vergi gibi ek yüklerle uğraşmadan sadece sürüşünüze odaklanırsınız.

Uzun dönem kiralama sayesinde hem bütçenizi kontrol altında tutar hem de ihtiyacınıza uygun aracı sürekli kullanma konforunu yaşarsınız.

Şimşekoğlu Filo ile uzun vadede kazançlı çıkın, işinizi büyütürken biz araç ihtiyacınızı karşılayalım.

Şimşekoğlu Filo, şirketlerin operasyonel ihtiyaçları için farklı segmentlerde aylık araç kiralama çözümleri sunar.`,
  whySimsekogluTextEn: `Şimşekoğlu Fleet offers reliable, economical, and sustainable long-term rental solutions. Instead of carrying ownership costs and responsibilities, you benefit from fixed monthly payments and focus on your operations.

You can focus only on driving and operations without dealing with additional burdens such as insurance, maintenance, and tax.

Long-term rental helps you control your budget while continuously using a vehicle that matches your needs.

With Şimşekoğlu Fleet, gain long-term value while we cover your fleet needs as your business grows.

Şimşekoğlu Fleet provides monthly rental solutions across different segments for corporate operational needs.`,
  legalNoteMain:
    "Araç görseli temsilidir. Teklif içeriğindeki otomobil ile farklılık gösterebilir. Tüm fiyatlar şirketlere özel filo kiralamaları için geçerli olup, fiyatlara KDV dahil değildir. Stoklarla sınırlıdır.",
  legalNoteSub:
    "* Üretici tarafından açıklanan şehir içi/dışı 100km/lt ortalama yakıt tüketim değeridir.",
  includedServices: fleetIncludedServices
};
