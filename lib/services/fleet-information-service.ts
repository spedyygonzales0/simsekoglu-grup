import { defaultFleetInformation } from "@/lib/data/fleet-information-default";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { readSiteContent, writeSiteContent } from "@/lib/storage/client";
import { FleetInformationContent, IncludedServiceItem } from "@/lib/types";

interface FleetInformationRow {
  id: string;
  content: unknown;
}

function normalizeServiceItem(item: unknown, index: number): IncludedServiceItem | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Partial<IncludedServiceItem>;
  const titleTr = record.titleTr?.trim() || "";
  const descriptionTr = record.descriptionTr?.trim() || "";
  return {
    id: record.id?.trim() || `service-${index + 1}`,
    icon: record.icon?.trim() || "SV",
    titleTr,
    descriptionTr,
    titleEn: record.titleEn?.trim() || "",
    descriptionEn: record.descriptionEn?.trim() || ""
  };
}

function normalizeFleetInformation(input: unknown): FleetInformationContent {
  const source = (input && typeof input === "object" ? input : {}) as Partial<FleetInformationContent>;
  const includedServices = Array.isArray(source.includedServices)
    ? source.includedServices
        .map((item, index) => normalizeServiceItem(item, index))
        .filter((item): item is IncludedServiceItem => Boolean(item))
    : defaultFleetInformation.includedServices;

  return {
    servicesText:
      typeof source.servicesText === "string" ? source.servicesText.trim() : defaultFleetInformation.servicesText,
    termsText:
      typeof source.termsText === "string" ? source.termsText.trim() : defaultFleetInformation.termsText,
    userRulesText:
      typeof source.userRulesText === "string" ? source.userRulesText.trim() : defaultFleetInformation.userRulesText,
    insurancePrivilegesTitleTr:
      typeof source.insurancePrivilegesTitleTr === "string"
        ? source.insurancePrivilegesTitleTr.trim()
        : defaultFleetInformation.insurancePrivilegesTitleTr || "",
    insurancePrivilegesTitleEn:
      typeof source.insurancePrivilegesTitleEn === "string"
        ? source.insurancePrivilegesTitleEn.trim()
        : defaultFleetInformation.insurancePrivilegesTitleEn || "",
    insurancePrivilegesTextTr:
      typeof source.insurancePrivilegesTextTr === "string"
        ? source.insurancePrivilegesTextTr.trim()
        : defaultFleetInformation.insurancePrivilegesTextTr || "",
    insurancePrivilegesTextEn:
      typeof source.insurancePrivilegesTextEn === "string"
        ? source.insurancePrivilegesTextEn.trim()
        : defaultFleetInformation.insurancePrivilegesTextEn || "",
    whySimsekogluTitleTr:
      typeof source.whySimsekogluTitleTr === "string"
        ? source.whySimsekogluTitleTr.trim()
        : defaultFleetInformation.whySimsekogluTitleTr || "",
    whySimsekogluTitleEn:
      typeof source.whySimsekogluTitleEn === "string"
        ? source.whySimsekogluTitleEn.trim()
        : defaultFleetInformation.whySimsekogluTitleEn || "",
    whySimsekogluTextTr:
      typeof source.whySimsekogluTextTr === "string"
        ? source.whySimsekogluTextTr.trim()
        : defaultFleetInformation.whySimsekogluTextTr || "",
    whySimsekogluTextEn:
      typeof source.whySimsekogluTextEn === "string"
        ? source.whySimsekogluTextEn.trim()
        : defaultFleetInformation.whySimsekogluTextEn || "",
    legalNoteMain:
      typeof source.legalNoteMain === "string" ? source.legalNoteMain.trim() : defaultFleetInformation.legalNoteMain,
    legalNoteSub:
      typeof source.legalNoteSub === "string" ? source.legalNoteSub.trim() : defaultFleetInformation.legalNoteSub,
    includedServices: includedServices.length ? includedServices : defaultFleetInformation.includedServices
  };
}

function readFallbackFleetInformation(): FleetInformationContent {
  const local = readSiteContent().fleetInformation;
  return normalizeFleetInformation(local);
}

function writeFallbackFleetInformation(fleetInformation: FleetInformationContent): void {
  const current = readSiteContent();
  writeSiteContent({
    ...current,
    fleetInformation
  });
}

export async function getFleetInformation(): Promise<FleetInformationContent> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("settings")
      .select("id, content")
      .eq("id", "fleet_information")
      .maybeSingle();

    if (!error && data) {
      return normalizeFleetInformation((data as FleetInformationRow).content);
    }
  }

  return readFallbackFleetInformation();
}

export async function updateFleetInformation(
  fleetInformation: FleetInformationContent
): Promise<FleetInformationContent> {
  const normalized = normalizeFleetInformation(fleetInformation);
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("settings")
      .upsert({ id: "fleet_information", content: normalized }, { onConflict: "id" })
      .select("id, content")
      .maybeSingle();

    if (!error && data) {
      const saved = normalizeFleetInformation((data as FleetInformationRow).content);
      writeFallbackFleetInformation(saved);
      return saved;
    }
  }

  writeFallbackFleetInformation(normalized);
  return normalized;
}
