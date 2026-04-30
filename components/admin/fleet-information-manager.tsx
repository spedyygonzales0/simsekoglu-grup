"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FleetInformationContent, IncludedServiceItem } from "@/lib/types";

type FleetTab = "general" | "legal" | "value" | "services";

interface FleetInformationManagerProps {
  initialContent: FleetInformationContent;
  onSave: (nextContent: FleetInformationContent) => void;
  onSaved?: (message: string) => void;
}

function createServiceRow(index = 1): IncludedServiceItem {
  return {
    id: `service-${Date.now()}-${index}`,
    icon: "SV",
    titleTr: "",
    titleEn: "",
    descriptionTr: "",
    descriptionEn: ""
  };
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-navy-900 text-white" : "border border-navy-900/20 bg-white text-navy-900 hover:bg-cloud-50"
      }`}
    >
      {children}
    </button>
  );
}

export function FleetInformationManager({ initialContent, onSave, onSaved }: FleetInformationManagerProps) {
  const [tab, setTab] = useState<FleetTab>("general");
  const [form, setForm] = useState<FleetInformationContent>(initialContent);

  useEffect(() => {
    setForm(initialContent);
  }, [initialContent]);

  const serviceCount = useMemo(() => (form.includedServices || []).length, [form.includedServices]);

  const setServiceField = (index: number, field: keyof IncludedServiceItem, value: string) => {
    setForm((prev) => {
      const next = [...(prev.includedServices || [])];
      const current = next[index];
      if (!current) return prev;
      next[index] = { ...current, [field]: value };
      return { ...prev, includedServices: next };
    });
  };

  const addService = () => {
    setForm((prev) => ({
      ...prev,
      includedServices: [...(prev.includedServices || []), createServiceRow((prev.includedServices || []).length + 1)]
    }));
  };

  const removeService = (index: number) => {
    setForm((prev) => ({
      ...prev,
      includedServices: (prev.includedServices || []).filter((_, rowIndex) => rowIndex !== index)
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedServices = (form.includedServices || [])
      .map((item, index) => ({
        ...item,
        id: item.id?.trim() || `service-${index + 1}`,
        icon: (item.icon || "SV").trim().slice(0, 3).toUpperCase(),
        titleTr: item.titleTr.trim(),
        titleEn: item.titleEn.trim(),
        descriptionTr: item.descriptionTr.trim(),
        descriptionEn: item.descriptionEn.trim()
      }))
      .filter((item) => item.titleTr || item.titleEn || item.descriptionTr || item.descriptionEn);

    onSave({
      servicesText: form.servicesText.trim(),
      termsText: form.termsText.trim(),
      userRulesText: form.userRulesText.trim(),
      insurancePrivilegesTitleTr: form.insurancePrivilegesTitleTr?.trim() || "",
      insurancePrivilegesTitleEn: form.insurancePrivilegesTitleEn?.trim() || "",
      insurancePrivilegesTextTr: form.insurancePrivilegesTextTr?.trim() || "",
      insurancePrivilegesTextEn: form.insurancePrivilegesTextEn?.trim() || "",
      whySimsekogluTitleTr: form.whySimsekogluTitleTr?.trim() || "",
      whySimsekogluTitleEn: form.whySimsekogluTitleEn?.trim() || "",
      whySimsekogluTextTr: form.whySimsekogluTextTr?.trim() || "",
      whySimsekogluTextEn: form.whySimsekogluTextEn?.trim() || "",
      legalNoteMain: form.legalNoteMain.trim(),
      legalNoteSub: form.legalNoteSub.trim(),
      includedServices: normalizedServices
    });
    onSaved?.("Filo bilgilendirme ayarları kaydedildi.");
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-base leading-7 text-blue-900">
        Bu bilgiler tüm araç detaylarında ortak görünür. Bir kez düzenleyip kaydetmeniz yeterlidir.
      </div>

      <div className="rounded-xl border border-navy-900/10 bg-cloud-50 p-4">
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "general"} onClick={() => setTab("general")}>
            Genel Metinler
          </TabButton>
          <TabButton active={tab === "legal"} onClick={() => setTab("legal")}>
            Şartlar ve Yasal Not
          </TabButton>
          <TabButton active={tab === "value"} onClick={() => setTab("value")}>
            Kasko ve Neden Biz
          </TabButton>
          <TabButton active={tab === "services"} onClick={() => setTab("services")}>
            Fiyata Dahil Hizmetler ({serviceCount})
          </TabButton>
        </div>
      </div>

      {tab === "general" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="admin-label">Hizmetlerimiz (Genel Metin)</span>
            <textarea
              rows={5}
              value={form.servicesText}
              onChange={(event) => setForm((prev) => ({ ...prev, servicesText: event.target.value }))}
              className="admin-input min-h-[130px]"
            />
          </label>
          <label className="space-y-1">
            <span className="admin-label">Şartlarımız (Genel Metin)</span>
            <textarea
              rows={5}
              value={form.termsText}
              onChange={(event) => setForm((prev) => ({ ...prev, termsText: event.target.value }))}
              className="admin-input min-h-[130px]"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="admin-label">Kullanıcı Kurallarımız (Genel Metin)</span>
            <textarea
              rows={5}
              value={form.userRulesText}
              onChange={(event) => setForm((prev) => ({ ...prev, userRulesText: event.target.value }))}
              className="admin-input min-h-[130px]"
            />
          </label>
        </div>
      ) : null}

      {tab === "legal" ? (
        <div className="grid gap-4">
          <label className="space-y-1">
            <span className="admin-label">Araç Detay Yasal Notu (Ana Not)</span>
            <textarea
              rows={5}
              value={form.legalNoteMain}
              onChange={(event) => setForm((prev) => ({ ...prev, legalNoteMain: event.target.value }))}
              className="admin-input min-h-[130px]"
            />
          </label>
          <label className="space-y-1">
            <span className="admin-label">Yasal Not (Alt Not)</span>
            <textarea
              rows={4}
              value={form.legalNoteSub}
              onChange={(event) => setForm((prev) => ({ ...prev, legalNoteSub: event.target.value }))}
              className="admin-input min-h-[110px]"
            />
          </label>
        </div>
      ) : null}

      {tab === "value" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="admin-label">Kasko Başlık (TR)</span>
            <input
              value={form.insurancePrivilegesTitleTr || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, insurancePrivilegesTitleTr: event.target.value }))}
              className="admin-input"
            />
          </label>
          <label className="space-y-1">
            <span className="admin-label">Kasko Başlık (EN)</span>
            <input
              value={form.insurancePrivilegesTitleEn || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, insurancePrivilegesTitleEn: event.target.value }))}
              className="admin-input"
            />
          </label>
          <label className="space-y-1">
            <span className="admin-label">Kasko İçeriği (TR)</span>
            <textarea
              rows={7}
              value={form.insurancePrivilegesTextTr || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, insurancePrivilegesTextTr: event.target.value }))}
              className="admin-input min-h-[160px]"
            />
          </label>
          <label className="space-y-1">
            <span className="admin-label">Kasko İçeriği (EN)</span>
            <textarea
              rows={7}
              value={form.insurancePrivilegesTextEn || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, insurancePrivilegesTextEn: event.target.value }))}
              className="admin-input min-h-[160px]"
            />
          </label>
          <label className="space-y-1">
            <span className="admin-label">Neden Şimşekoğlu Başlık (TR)</span>
            <input
              value={form.whySimsekogluTitleTr || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, whySimsekogluTitleTr: event.target.value }))}
              className="admin-input"
            />
          </label>
          <label className="space-y-1">
            <span className="admin-label">Why Şimşekoğlu Başlık (EN)</span>
            <input
              value={form.whySimsekogluTitleEn || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, whySimsekogluTitleEn: event.target.value }))}
              className="admin-input"
            />
          </label>
          <label className="space-y-1">
            <span className="admin-label">Neden Şimşekoğlu İçeriği (TR)</span>
            <textarea
              rows={9}
              value={form.whySimsekogluTextTr || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, whySimsekogluTextTr: event.target.value }))}
              className="admin-input min-h-[180px]"
            />
          </label>
          <label className="space-y-1">
            <span className="admin-label">Why Şimşekoğlu İçeriği (EN)</span>
            <textarea
              rows={9}
              value={form.whySimsekogluTextEn || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, whySimsekogluTextEn: event.target.value }))}
              className="admin-input min-h-[180px]"
            />
          </label>
        </div>
      ) : null}

      {tab === "services" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-900/10 bg-cloud-50 p-3">
            <p className="small-note text-[15px] leading-7 text-navy-900/78">
              Araç detay penceresinde görünen “Fiyata Dahil Hizmetler” kartları.
            </p>
            <button
              type="button"
              onClick={addService}
              className="rounded-lg border border-navy-900/20 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-700"
            >
              Hizmet Ekle
            </button>
          </div>

          {(form.includedServices || []).length ? (
            <div className="space-y-4">
              {(form.includedServices || []).map((service, index) => (
                <div key={service.id || index} className="rounded-xl border border-navy-900/12 bg-white p-4 shadow-soft">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="font-semibold text-navy-900">Hizmet {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="admin-label">İkon Kodu (2-3 harf)</span>
                      <input
                        value={service.icon || ""}
                        onChange={(event) => setServiceField(index, "icon", event.target.value)}
                        className="admin-input"
                        maxLength={3}
                      />
                    </label>
                    <div />
                    <label className="space-y-1">
                      <span className="admin-label">Başlık (TR)</span>
                      <input
                        value={service.titleTr}
                        onChange={(event) => setServiceField(index, "titleTr", event.target.value)}
                        className="admin-input"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="admin-label">Başlık (EN)</span>
                      <input
                        value={service.titleEn}
                        onChange={(event) => setServiceField(index, "titleEn", event.target.value)}
                        className="admin-input"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="admin-label">Açıklama (TR)</span>
                      <textarea
                        rows={3}
                        value={service.descriptionTr}
                        onChange={(event) => setServiceField(index, "descriptionTr", event.target.value)}
                        className="admin-input"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="admin-label">Açıklama (EN)</span>
                      <textarea
                        rows={3}
                        value={service.descriptionEn}
                        onChange={(event) => setServiceField(index, "descriptionEn", event.target.value)}
                        className="admin-input"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-navy-900/20 bg-cloud-50 p-4 text-sm text-navy-900/70">
              Henüz hizmet kartı yok. “Hizmet Ekle” ile yeni bir kart ekleyebilirsiniz.
            </div>
          )}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button type="submit" className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white">
          Kaydet
        </button>
      </div>
    </form>
  );
}

