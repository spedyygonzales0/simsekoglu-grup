import { defaultSiteContent } from "@/lib/data/default-site-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { readSiteContent, writeSiteContent } from "@/lib/storage/client";
import { SettingsContent } from "@/lib/types";

interface SettingsRow {
  id: string;
  content: unknown;
}

const SETTINGS_ROW_ID = "site_settings";

function normalizeSettings(input: unknown): SettingsContent {
  const source = (input && typeof input === "object" ? input : {}) as Partial<SettingsContent>;
  return {
    maintenanceMode: Boolean(source.maintenanceMode),
    contactEmail:
      typeof source.contactEmail === "string" && source.contactEmail.trim()
        ? source.contactEmail.trim()
        : defaultSiteContent.settings.contactEmail,
    currency: source.currency === "TRY" ? "TRY" : defaultSiteContent.settings.currency
  };
}

function readFallbackSettings(): SettingsContent {
  return normalizeSettings(readSiteContent().settings);
}

function writeFallbackSettings(settings: SettingsContent): void {
  const current = readSiteContent();
  writeSiteContent({
    ...current,
    settings
  });
}

export async function getSettings(): Promise<SettingsContent> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("settings")
      .select("id, content")
      .eq("id", SETTINGS_ROW_ID)
      .maybeSingle();

    if (!error && data) {
      return normalizeSettings((data as SettingsRow).content);
    }
  }

  return readFallbackSettings();
}

export async function updateSettings(settings: SettingsContent): Promise<SettingsContent> {
  const normalized = normalizeSettings(settings);
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("settings")
      .upsert({ id: SETTINGS_ROW_ID, content: normalized }, { onConflict: "id" })
      .select("id, content")
      .maybeSingle();

    if (!error && data) {
      const saved = normalizeSettings((data as SettingsRow).content);
      writeFallbackSettings(saved);
      return saved;
    }
  }

  writeFallbackSettings(normalized);
  return normalized;
}

