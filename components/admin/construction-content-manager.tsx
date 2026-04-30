"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ConstructionContent, ProjectCardTextContent, ProjectCardTextGroups } from "@/lib/types";

interface ConstructionContentManagerProps {
  initialContent: ConstructionContent;
  initialProjectTextGroups: ProjectCardTextGroups["construction"];
  projectIds: string[];
  onSave: (payload: {
    content: ConstructionContent;
    projectTexts: ProjectCardTextGroups["construction"];
  }) => void;
  onSaved?: (message: string) => void;
}

type TabKey = "content" | "cards";

function emptyProjectCardText(projectId: string): ProjectCardTextContent {
  return {
    titleTr: projectId,
    titleEn: projectId,
    summaryTr: "",
    summaryEn: "",
    locationTr: "Türkiye",
    locationEn: "Turkey"
  };
}

function groupedIds(projectIds: string[]): Array<{ label: string; ids: string[] }> {
  const factory = projectIds.filter((id) => id.startsWith("FBK-"));
  const housing = projectIds.filter((id) => id.startsWith("KNT-"));
  const others = projectIds.filter((id) => !id.startsWith("FBK-") && !id.startsWith("KNT-"));

  const groups: Array<{ label: string; ids: string[] }> = [];
  if (factory.length) groups.push({ label: "Fabrika / Sanayi", ids: factory });
  if (housing.length) groups.push({ label: "Konut", ids: housing });
  if (others.length) groups.push({ label: "Diğer", ids: others });
  return groups;
}

export function ConstructionContentManager({
  initialContent,
  initialProjectTextGroups,
  projectIds,
  onSave,
  onSaved
}: ConstructionContentManagerProps) {
  const [tab, setTab] = useState<TabKey>("content");
  const [projectSearch, setProjectSearch] = useState("");
  const [contentForm, setContentForm] = useState<ConstructionContent>(initialContent);
  const [cardTexts, setCardTexts] = useState<ProjectCardTextGroups["construction"]>(initialProjectTextGroups || {});

  useEffect(() => {
    setContentForm(initialContent);
  }, [initialContent]);

  useEffect(() => {
    setCardTexts(initialProjectTextGroups || {});
  }, [initialProjectTextGroups]);

  const groups = useMemo(() => groupedIds(projectIds), [projectIds]);
  const filteredGroups = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        ids: group.ids.filter((id) => id.toLowerCase().includes(q))
      }))
      .filter((group) => group.ids.length > 0);
  }, [groups, projectSearch]);

  const setCardField = (projectId: string, field: keyof ProjectCardTextContent, value: string) => {
    setCardTexts((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || emptyProjectCardText(projectId)),
        [field]: value
      }
    }));
  };

  const submitContent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ content: contentForm, projectTexts: cardTexts });
    onSaved?.("İnşaat içerikleri kaydedildi.");
  };

  const submitCards = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ content: contentForm, projectTexts: cardTexts });
    onSaved?.("İnşaat proje kart metinleri kaydedildi.");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-navy-900/10 bg-cloud-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-navy-900">İnşaat İçerik Yönetimi</p>
            <p className="text-xs text-navy-900/70">Mimarlık yönetimi ile aynı yapıda, mobil uyumlu düzenleme alanı.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("content")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === "content"
                  ? "bg-navy-900 text-white"
                  : "border border-navy-900/20 bg-white text-navy-900 hover:bg-cloud-50"
              }`}
            >
              Genel İçerik
            </button>
            <button
              type="button"
              onClick={() => setTab("cards")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === "cards"
                  ? "bg-navy-900 text-white"
                  : "border border-navy-900/20 bg-white text-navy-900 hover:bg-cloud-50"
              }`}
            >
              Proje Kart Metinleri
            </button>
          </div>
        </div>
      </div>

      {tab === "content" ? (
        <form onSubmit={submitContent} className="space-y-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="admin-label">Başlık (TR)</span>
              <input
                value={contentForm.titleTr}
                onChange={(event) => setContentForm((prev) => ({ ...prev, titleTr: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="space-y-1">
              <span className="admin-label">Başlık (EN)</span>
              <input
                value={contentForm.titleEn}
                onChange={(event) => setContentForm((prev) => ({ ...prev, titleEn: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="admin-label">Açıklama (TR)</span>
              <textarea
                rows={3}
                value={contentForm.descriptionTr}
                onChange={(event) => setContentForm((prev) => ({ ...prev, descriptionTr: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="admin-label">Açıklama (EN)</span>
              <textarea
                rows={3}
                value={contentForm.descriptionEn}
                onChange={(event) => setContentForm((prev) => ({ ...prev, descriptionEn: event.target.value }))}
                className="admin-input"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="admin-label">Konut (TR)</span>
              <textarea
                rows={2}
                value={contentForm.residentialTr}
                onChange={(event) => setContentForm((prev) => ({ ...prev, residentialTr: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="space-y-1">
              <span className="admin-label">Konut (EN)</span>
              <textarea
                rows={2}
                value={contentForm.residentialEn}
                onChange={(event) => setContentForm((prev) => ({ ...prev, residentialEn: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="space-y-1">
              <span className="admin-label">Ticari (TR)</span>
              <textarea
                rows={2}
                value={contentForm.commercialTr}
                onChange={(event) => setContentForm((prev) => ({ ...prev, commercialTr: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="space-y-1">
              <span className="admin-label">Ticari (EN)</span>
              <textarea
                rows={2}
                value={contentForm.commercialEn}
                onChange={(event) => setContentForm((prev) => ({ ...prev, commercialEn: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="space-y-1">
              <span className="admin-label">Renovasyon (TR)</span>
              <textarea
                rows={2}
                value={contentForm.renovationTr}
                onChange={(event) => setContentForm((prev) => ({ ...prev, renovationTr: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="space-y-1">
              <span className="admin-label">Renovasyon (EN)</span>
              <textarea
                rows={2}
                value={contentForm.renovationEn}
                onChange={(event) => setContentForm((prev) => ({ ...prev, renovationEn: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="space-y-1">
              <span className="admin-label">Anahtar Teslim (TR)</span>
              <textarea
                rows={2}
                value={contentForm.turnkeyTr}
                onChange={(event) => setContentForm((prev) => ({ ...prev, turnkeyTr: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="space-y-1">
              <span className="admin-label">Anahtar Teslim (EN)</span>
              <textarea
                rows={2}
                value={contentForm.turnkeyEn}
                onChange={(event) => setContentForm((prev) => ({ ...prev, turnkeyEn: event.target.value }))}
                className="admin-input"
              />
            </label>
          </div>

          <button type="submit" className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white">
            Kaydet
          </button>
        </form>
      ) : null}

      {tab === "cards" ? (
        <form onSubmit={submitCards} className="space-y-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-soft">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <label className="space-y-1">
              <span className="admin-label">Proje Ara</span>
              <input
                value={projectSearch}
                onChange={(event) => setProjectSearch(event.target.value)}
                className="admin-input"
                placeholder="Örn: KNT-001 veya FBK-002"
              />
            </label>
            <p className="small-note text-navy-900/75">
              Toplam {projectIds.length} proje kimliği bulundu.
            </p>
          </div>

          {filteredGroups.length ? filteredGroups.map((group) => (
            <div key={group.label} className="space-y-3">
              <p className="text-base font-bold text-navy-900">{group.label}</p>
              <div className="space-y-3">
                {group.ids.map((projectId) => {
                  const item = cardTexts[projectId] || emptyProjectCardText(projectId);
                  return (
                    <details key={projectId} className="rounded-xl border border-navy-900/12 bg-cloud-50 p-3">
                      <summary className="cursor-pointer text-sm font-semibold text-navy-900">{projectId}</summary>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <label className="space-y-1">
                          <span className="admin-label">Başlık (TR)</span>
                          <input
                            value={item.titleTr}
                            onChange={(event) => setCardField(projectId, "titleTr", event.target.value)}
                            className="admin-input"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="admin-label">Başlık (EN)</span>
                          <input
                            value={item.titleEn}
                            onChange={(event) => setCardField(projectId, "titleEn", event.target.value)}
                            className="admin-input"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="admin-label">Kısa Açıklama (TR)</span>
                          <textarea
                            rows={2}
                            value={item.summaryTr}
                            onChange={(event) => setCardField(projectId, "summaryTr", event.target.value)}
                            className="admin-input"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="admin-label">Kısa Açıklama (EN)</span>
                          <textarea
                            rows={2}
                            value={item.summaryEn}
                            onChange={(event) => setCardField(projectId, "summaryEn", event.target.value)}
                            className="admin-input"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="admin-label">Konum (TR)</span>
                          <input
                            value={item.locationTr}
                            onChange={(event) => setCardField(projectId, "locationTr", event.target.value)}
                            className="admin-input"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="admin-label">Konum (EN)</span>
                          <input
                            value={item.locationEn}
                            onChange={(event) => setCardField(projectId, "locationEn", event.target.value)}
                            className="admin-input"
                          />
                        </label>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-navy-900/20 bg-cloud-50 p-4 text-sm text-navy-900/70">
              Aramaya uygun proje bulunamadı.
            </div>
          )}

          <button type="submit" className="rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white">
            Kaydet
          </button>
        </form>
      ) : null}
    </div>
  );
}
