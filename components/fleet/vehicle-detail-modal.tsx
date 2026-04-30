"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { currencyTl, fuelTypeLabel, transmissionLabel } from "@/lib/i18n";
import {
  FleetInformationContent,
  FuelType,
  Locale,
  RentalKm,
  TransmissionType,
  Vehicle
} from "@/lib/types";

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  locale: Locale;
  images: string[];
  initialIndex?: number;
  selectedFuelType: FuelType | null;
  selectedTransmission: TransmissionType | null;
  selectedMonthlyKm: RentalKm | null;
  selectedPrice: number | null;
  fleetInformation: FleetInformationContent;
  quoteHref: string;
  canQuote: boolean;
}

type DetailTabKey = "package" | "terms" | "insurance" | "why";

function detailSummaryLabel(locale: Locale, key: "fuel" | "transmission" | "km" | "price"): string {
  if (locale === "en") {
    if (key === "fuel") return "Fuel";
    if (key === "transmission") return "Transmission";
    if (key === "km") return "Monthly KM";
    return "Monthly Price";
  }
  if (key === "fuel") return "Yakıt";
  if (key === "transmission") return "Vites";
  if (key === "km") return "Aylık KM";
  return "Aylık Fiyat";
}

function serviceTitle(locale: Locale): string {
  return locale === "tr" ? "Fiyata Dahil Olan Hizmetlerimiz" : "Services Included in Price";
}

function serviceSubtitle(locale: Locale): string {
  return locale === "tr"
    ? "Kurumsal operasyonel kiralama paketinizde sunulan ana hizmetler aşağıdadır."
    : "Core services included in your corporate operational rental package.";
}

function optionButtonLabel(locale: Locale): string {
  return locale === "tr" ? "OPSİYONLA" : "RESERVE VIA WHATSAPP";
}

function hasVisibleText(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function containsTurkishChars(value: string): boolean {
  return /[çğıöşüÇĞİÖŞÜ]/.test(value);
}

function toEnglishReadable(locale: Locale, value: string | undefined, fallbackEn: string): string {
  const text = value?.trim() || "";
  if (!text) return fallbackEn;
  if (locale === "en" && containsTurkishChars(text)) return fallbackEn;
  return text;
}

export function VehicleDetailModal({
  isOpen,
  onClose,
  vehicle,
  locale,
  images,
  initialIndex = 0,
  selectedFuelType,
  selectedTransmission,
  selectedMonthlyKm,
  selectedPrice,
  fleetInformation,
  quoteHref,
  canQuote
}: VehicleDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTabKey>("package");
  const [mobileAccordion, setMobileAccordion] = useState<DetailTabKey>("package");

  const uniqueImages = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const safeIndex = initialIndex >= 0 && initialIndex < uniqueImages.length ? initialIndex : 0;
  const activeImage = uniqueImages[activeIndex] || uniqueImages[safeIndex] || vehicle.mainImage;
  const hasMultiple = uniqueImages.length > 1;

  const servicesTextDisplay = toEnglishReadable(
    locale,
    fleetInformation.servicesText,
    "We manage your corporate fleet operations with centralized coordination and process tracking."
  );
  const termsTextDisplay = toEnglishReadable(
    locale,
    fleetInformation.termsText,
    "Rental operations are carried out according to contract terms. Scope, mileage package, and service levels are clarified at quotation stage."
  );
  const rulesTextDisplay = toEnglishReadable(
    locale,
    fleetInformation.userRulesText,
    "Users are responsible for compliant vehicle usage, periodic maintenance follow-up, and adherence to traffic rules."
  );
  const legalNoteMainDisplay = toEnglishReadable(
    locale,
    fleetInformation.legalNoteMain,
    "Vehicle visuals are representative. The quoted vehicle may differ. All prices are for corporate fleet rentals and exclude VAT. Subject to stock availability."
  );
  const legalNoteSubDisplay = toEnglishReadable(
    locale,
    fleetInformation.legalNoteSub,
    "* Fuel consumption values are average manufacturer-declared city/intercity values per 100km."
  );
  const insuranceTitleDisplay =
    locale === "tr"
      ? fleetInformation.insurancePrivilegesTitleTr?.trim() || ""
      : toEnglishReadable(locale, fleetInformation.insurancePrivilegesTitleEn, "Insurance Privileges Included");
  const insuranceTextDisplay =
    locale === "tr"
      ? fleetInformation.insurancePrivilegesTextTr?.trim() || ""
      : toEnglishReadable(
          locale,
          fleetInformation.insurancePrivilegesTextEn,
          "Tow truck, replacement vehicle, roadside support and policy-based operational privileges."
        );
  const whyTitleDisplay =
    locale === "tr"
      ? fleetInformation.whySimsekogluTitleTr?.trim() || ""
      : toEnglishReadable(locale, fleetInformation.whySimsekogluTitleEn, "Why Şimşekoğlu Fleet?");
  const whyTextDisplay =
    locale === "tr"
      ? fleetInformation.whySimsekogluTextTr?.trim() || ""
      : toEnglishReadable(
          locale,
          fleetInformation.whySimsekogluTextEn,
          "Reliable, cost-efficient and sustainable long-term fleet solutions for corporate operations."
        );

  const visibleIncludedServices = useMemo(
    () =>
      (fleetInformation.includedServices || []).filter((item) => {
        const title = locale === "tr" ? item.titleTr : item.titleEn || item.titleTr;
        const description = locale === "tr" ? item.descriptionTr : item.descriptionEn || item.descriptionTr;
        return hasVisibleText(title) && hasVisibleText(description);
      }),
    [fleetInformation.includedServices, locale]
  );

  const tabItems = useMemo(() => {
    const items: Array<{ key: DetailTabKey; label: string }> = [];

    if (hasVisibleText(servicesTextDisplay) || visibleIncludedServices.length > 0) {
      items.push({ key: "package", label: locale === "tr" ? "Paket İçeriği" : "Package Content" });
    }

    if (hasVisibleText(termsTextDisplay) || hasVisibleText(rulesTextDisplay) || hasVisibleText(legalNoteMainDisplay) || hasVisibleText(legalNoteSubDisplay)) {
      items.push({ key: "terms", label: locale === "tr" ? "Şartlar ve Kurallar" : "Terms & Rules" });
    }

    if (hasVisibleText(insuranceTitleDisplay) || hasVisibleText(insuranceTextDisplay)) {
      items.push({ key: "insurance", label: locale === "tr" ? "Kasko Ayrıcalıkları" : "Casco Privileges" });
    }

    if (hasVisibleText(whyTitleDisplay) || hasVisibleText(whyTextDisplay)) {
      items.push({ key: "why", label: locale === "tr" ? "Neden Biz?" : "Why Us?" });
    }

    return items;
  }, [
    insuranceTextDisplay,
    insuranceTitleDisplay,
    legalNoteMainDisplay,
    legalNoteSubDisplay,
    locale,
    rulesTextDisplay,
    servicesTextDisplay,
    termsTextDisplay,
    visibleIncludedServices.length,
    whyTextDisplay,
    whyTitleDisplay
  ]);

  const hasAnyDetailTabs = tabItems.length > 0;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(safeIndex);
  }, [isOpen, safeIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const firstTab = tabItems[0]?.key;
    if (!firstTab) return;
    setActiveTab(firstTab);
    setMobileAccordion(firstTab);
  }, [isOpen, tabItems]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (!hasMultiple) return;
      if (event.key === "ArrowRight") setActiveIndex((prev) => (prev + 1) % uniqueImages.length);
      if (event.key === "ArrowLeft") setActiveIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, isOpen, onClose, uniqueImages.length]);

  if (!mounted || !isOpen) return null;

  const renderPackageContent = () => (
    <div className="space-y-4">
      {hasVisibleText(servicesTextDisplay) ? (
        <div className="rounded-xl border border-navy-900/10 bg-white p-4">
          <h5 className="text-[1.05rem] font-extrabold text-navy-900">{locale === "tr" ? "Hizmetlerimiz" : "Our Services"}</h5>
          <p className="mt-2 text-base leading-7 text-navy-900/86">{servicesTextDisplay}</p>
        </div>
      ) : null}

      {visibleIncludedServices.length ? (
        <div className="rounded-xl border border-navy-900/10 bg-white p-4 sm:p-5">
          <h5 className="text-[1.15rem] font-extrabold text-navy-900">{serviceTitle(locale)}</h5>
          <p className="mt-1 text-[15px] leading-7 text-navy-900/76">{serviceSubtitle(locale)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleIncludedServices.map((service) => (
              <article key={service.id} className="rounded-xl border border-navy-900/10 bg-cloud-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                    {(service.icon || "SV").slice(0, 2).toUpperCase()}
                  </span>
                  <h6 className="text-[1rem] font-bold text-navy-900">
                    {locale === "tr" ? service.titleTr : service.titleEn || service.titleTr}
                  </h6>
                </div>
                <p className="mt-2 text-[15px] leading-7 text-navy-900/82">
                  {locale === "tr" ? service.descriptionTr : service.descriptionEn || service.descriptionTr}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderTermsContent = () => (
    <div className="space-y-3 rounded-xl border border-navy-900/10 bg-white p-4 sm:p-5">
      {hasVisibleText(termsTextDisplay) ? <p className="text-base leading-7 text-navy-900/86">{termsTextDisplay}</p> : null}
      {hasVisibleText(rulesTextDisplay) ? <p className="text-base leading-7 text-navy-900/86">{rulesTextDisplay}</p> : null}
      {hasVisibleText(legalNoteMainDisplay) || hasVisibleText(legalNoteSubDisplay) ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[15px] leading-7 text-navy-900">
          {hasVisibleText(legalNoteMainDisplay) ? <p>{legalNoteMainDisplay}</p> : null}
          {hasVisibleText(legalNoteSubDisplay) ? <p className="mt-2">{legalNoteSubDisplay}</p> : null}
        </div>
      ) : null}
    </div>
  );

  const renderInsuranceContent = () => (
    <div className="rounded-xl border border-navy-900/10 bg-white p-4 sm:p-5">
      {hasVisibleText(insuranceTitleDisplay) ? (
        <h5 className="text-[1.1rem] font-extrabold text-navy-900">{insuranceTitleDisplay}</h5>
      ) : null}
      {hasVisibleText(insuranceTextDisplay) ? (
        <p className="mt-2 whitespace-pre-line text-base leading-7 text-navy-900/86">{insuranceTextDisplay}</p>
      ) : null}
    </div>
  );

  const renderWhyContent = () => (
    <div className="rounded-xl border border-navy-900/10 bg-white p-4 sm:p-5">
      {hasVisibleText(whyTitleDisplay) ? (
        <h5 className="text-[1.1rem] font-extrabold text-navy-900">{whyTitleDisplay}</h5>
      ) : null}
      {hasVisibleText(whyTextDisplay) ? (
        <p className="mt-2 whitespace-pre-line text-base leading-7 text-navy-900/86">{whyTextDisplay}</p>
      ) : null}
    </div>
  );

  const renderTabContent = (tab: DetailTabKey) => {
    if (tab === "package") return renderPackageContent();
    if (tab === "terms") return renderTermsContent();
    if (tab === "insurance") return renderInsuranceContent();
    return renderWhyContent();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] overflow-y-auto bg-navy-950/78 px-2 py-2 backdrop-blur-[2px] sm:px-4 sm:py-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="mx-auto flex min-h-[calc(100dvh-1rem)] w-full max-w-[1340px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_30px_70px_-20px_rgba(4,15,31,0.55)] sm:min-h-[calc(100dvh-2rem)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${vehicle.brand} ${vehicle.model}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-navy-900/10 bg-white px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold tracking-[0.14em] text-gold-700">{locale === "tr" ? "Araç Detayı" : "Vehicle Detail"}</p>
            <h3 className="mt-1 text-[1.7rem] font-extrabold uppercase tracking-[0.02em] text-navy-900 sm:text-[1.85rem]">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-base font-semibold text-navy-900/76">
              {locale === "tr" ? "Model Yılı" : "Model Year"}: {vehicle.modelYearLabel || "2024+"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-navy-900/20 px-4 py-2 text-base font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-700"
          >
            {locale === "tr" ? "Kapat" : "Close"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-cloud-50/35 p-3 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <section className="rounded-2xl border border-navy-900/10 bg-white p-3 shadow-soft sm:p-4">
              <div className="relative overflow-hidden rounded-xl border border-navy-900/10 bg-cloud-100">
                {activeImage ? (
                  <Image
                    src={activeImage}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    width={1800}
                    height={1100}
                    className="h-[260px] w-full object-contain sm:h-[360px] lg:h-[430px]"
                    sizes="(max-width: 1024px) 100vw, 62vw"
                    priority
                  />
                ) : (
                  <div className="flex h-[260px] items-center justify-center text-base text-navy-900/70 sm:h-[360px] lg:h-[430px]">
                    {locale === "tr" ? "Görsel bulunamadı." : "Image not found."}
                  </div>
                )}

                {hasMultiple ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/92 px-3 py-1.5 text-base font-bold text-navy-900 shadow"
                      aria-label={locale === "tr" ? "Önceki görsel" : "Previous image"}
                    >
                      {"<"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveIndex((prev) => (prev + 1) % uniqueImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/92 px-3 py-1.5 text-base font-bold text-navy-900 shadow"
                      aria-label={locale === "tr" ? "Sonraki görsel" : "Next image"}
                    >
                      {">"}
                    </button>
                  </>
                ) : null}
              </div>

              {hasMultiple ? (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                  {uniqueImages.map((imagePath, index) => (
                    <button
                      key={`${imagePath}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`overflow-hidden rounded-lg border ${index === activeIndex ? "border-gold-500" : "border-navy-900/15"}`}
                    >
                      <Image
                        src={imagePath}
                        alt={`${vehicle.brand} ${vehicle.model} thumbnail ${index + 1}`}
                        width={220}
                        height={160}
                        className="h-14 w-full object-cover sm:h-16"
                        sizes="120px"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="space-y-4 rounded-2xl border border-navy-900/12 bg-white p-4 shadow-soft sm:p-5">
              <h4 className="text-xl font-extrabold text-navy-900">{locale === "tr" ? "Paket Özeti" : "Package Summary"}</h4>
              <p className="text-base leading-7 text-navy-900/86">{locale === "tr" ? vehicle.infoTr : vehicle.infoEn || vehicle.infoTr}</p>

              <dl className="grid gap-2 rounded-xl border border-navy-900/10 bg-cloud-50 p-3 text-[15px] leading-7 text-navy-900/86">
                <div className="flex items-start justify-between gap-3"><dt className="font-semibold">{detailSummaryLabel(locale, "fuel")}</dt><dd>{selectedFuelType ? fuelTypeLabel(selectedFuelType, locale) : "-"}</dd></div>
                <div className="flex items-start justify-between gap-3"><dt className="font-semibold">{detailSummaryLabel(locale, "transmission")}</dt><dd>{selectedTransmission ? transmissionLabel(selectedTransmission, locale) : "-"}</dd></div>
                <div className="flex items-start justify-between gap-3"><dt className="font-semibold">{detailSummaryLabel(locale, "km")}</dt><dd>{selectedMonthlyKm ? `${selectedMonthlyKm.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")} KM` : "-"}</dd></div>
                <div className="flex items-start justify-between gap-3"><dt className="font-semibold">{detailSummaryLabel(locale, "price")}</dt><dd className="font-bold text-navy-950">{typeof selectedPrice === "number" ? currencyTl(selectedPrice, locale) : "-"}</dd></div>
              </dl>

              <div className="pt-1">
                {canQuote ? (
                  <Link
                    href={quoteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-full bg-gold-600 px-4 py-3 text-base font-bold tracking-[0.03em] text-navy-950 transition hover:bg-gold-500"
                  >
                    {optionButtonLabel(locale)}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full items-center justify-center rounded-full bg-slate-300 px-4 py-3 text-base font-bold tracking-[0.03em] text-slate-700"
                  >
                    {optionButtonLabel(locale)}
                  </button>
                )}
              </div>
            </section>
          </div>

          {hasAnyDetailTabs ? (
            <section className="mt-5 rounded-2xl border border-navy-900/10 bg-cloud-100/55 p-3 sm:p-4">
              <div className="hidden gap-2 lg:flex lg:flex-wrap">
                {tabItems.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab.key
                        ? "border-gold-500 bg-gold-50 text-gold-700"
                        : "border-navy-900/20 bg-white text-navy-900 hover:border-gold-500 hover:text-gold-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-0 hidden lg:block lg:mt-4">{renderTabContent(activeTab)}</div>

              <div className="space-y-2 lg:hidden">
                {tabItems.map((tab) => {
                  const isOpenAccordion = mobileAccordion === tab.key;
                  return (
                    <div key={tab.key} className="rounded-xl border border-navy-900/12 bg-white">
                      <button
                        type="button"
                        onClick={() => setMobileAccordion(isOpenAccordion ? tabItems[0].key : tab.key)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-[15px] font-semibold text-navy-900"
                      >
                        <span>{tab.label}</span>
                        <span className="text-lg leading-none text-navy-900/70">{isOpenAccordion ? "−" : "+"}</span>
                      </button>
                      {isOpenAccordion ? <div className="border-t border-navy-900/10 p-3">{renderTabContent(tab.key)}</div> : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
