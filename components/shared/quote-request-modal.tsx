"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSiteData } from "@/components/providers/site-data-provider";
import { ServiceType } from "@/lib/types";

const SERVICE_OPTIONS: ServiceType[] = ["construction", "architecture", "fleet"];

export function QuoteRequestModal() {
  const { locale, quoteModalState, closeQuoteModal, createQuoteRequest } = useSiteData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("construction");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const serviceLabel = useMemo(
    () => ({
      construction: locale === "tr" ? "İnşaat" : "Construction",
      architecture: locale === "tr" ? "Mimarlık" : "Architecture",
      fleet: locale === "tr" ? "Araç Kiralama" : "Fleet Rental"
    }),
    [locale]
  );

  useEffect(() => {
    if (!quoteModalState.isOpen) return;

    const defaults = quoteModalState.defaults;
    setServiceType(defaults.serviceType ?? "construction");

    const selectedFleet = [defaults.selectedVehicleLabel, defaults.selectedVariantLabel]
      .filter(Boolean)
      .join(" / ");
    const selectedProject = defaults.selectedProjectLabel ?? "";

    setName("");
    setPhone("");
    setEmail("");
    setSelectedLabel(selectedFleet || selectedProject);
    setMessage("");
    setStatus("");
    setError("");
  }, [quoteModalState.defaults, quoteModalState.isOpen]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = createQuoteRequest({
      name,
      phone,
      email,
      serviceType,
      selectedVehicleSlug: quoteModalState.defaults.selectedVehicleSlug,
      selectedVehicleLabel: quoteModalState.defaults.selectedVehicleLabel,
      selectedVariantId: quoteModalState.defaults.selectedVariantId,
      selectedVariantLabel: quoteModalState.defaults.selectedVariantLabel,
      selectedProjectId: quoteModalState.defaults.selectedProjectId,
      selectedProjectLabel: quoteModalState.defaults.selectedProjectLabel,
      message: selectedLabel ? `${selectedLabel}\n${message}` : message
    });

    if (!result.ok) {
      setError(result.message);
      setStatus("");
      return;
    }

    setError("");
    setStatus(result.message);
    setTimeout(() => {
      closeQuoteModal();
    }, 900);
  };

  if (!quoteModalState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-900/70 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-500">
              {locale === "tr" ? "Teklif Talebi" : "Quote Request"}
            </p>
            <h3 className="mt-2 font-display text-3xl text-navy-900">
              {locale === "tr" ? "Form ile Teklif" : "Quote Form"}
            </h3>
            <p className="mt-2 text-sm text-navy-900/65">
              {locale === "tr"
                ? "Ana kanal WhatsApp'tır. Bu form ikincil talep kanalıdır."
                : "WhatsApp is the primary channel. This form is a secondary quote channel."}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-navy-900/20 px-3 py-2 text-sm"
            onClick={closeQuoteModal}
          >
            {locale === "tr" ? "Kapat" : "Close"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-navy-900">{locale === "tr" ? "Ad Soyad" : "Name"}</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-navy-900">{locale === "tr" ? "Telefon" : "Phone"}</span>
            <input
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-navy-900">E-posta</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-navy-900">{locale === "tr" ? "Hizmet Türü" : "Service"}</span>
            <select
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value as ServiceType)}
              className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
            >
              {SERVICE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {serviceLabel[option]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block space-y-1">
          <span className="text-sm font-medium text-navy-900">
            {locale === "tr" ? "Seçilen Araç/Proje" : "Selected Vehicle/Project"}
          </span>
          <input
            value={selectedLabel}
            onChange={(event) => setSelectedLabel(event.target.value)}
            placeholder={locale === "tr" ? "Opsiyonel" : "Optional"}
            className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
          />
        </label>

        <label className="mt-4 block space-y-1">
          <span className="text-sm font-medium text-navy-900">{locale === "tr" ? "Mesaj" : "Message"}</span>
          <textarea
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full rounded-lg border border-navy-900/20 px-3 py-2"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {status ? <p className="mt-3 text-sm text-green-700">{status}</p> : null}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeQuoteModal}
            className="rounded-full border border-navy-900/20 px-5 py-2 text-sm font-semibold text-navy-900"
          >
            {locale === "tr" ? "Vazgeç" : "Cancel"}
          </button>
          <button
            type="submit"
            className="rounded-full bg-gold-500 px-6 py-2 text-sm font-semibold text-navy-900 transition hover:bg-gold-400"
          >
            {locale === "tr" ? "Formu Gönder" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
