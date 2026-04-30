import { defaultSiteContent } from "@/lib/data/default-site-content";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { Locale, QuoteRequest, SiteContent } from "@/lib/types";

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const parsed = safeParse<T>(localStorage.getItem(key));
  return parsed ?? fallback;
}

function writeStorage<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function readSiteContent(): SiteContent {
  if (!canUseStorage()) return defaultSiteContent;

  const current = safeParse<SiteContent>(localStorage.getItem(STORAGE_KEYS.siteContent));
  if (current) return current;

  const legacyV2 = safeParse<SiteContent>(localStorage.getItem("simsekoglu_site_content_v2"));
  if (legacyV2) return legacyV2;

  const legacyV1 = safeParse<SiteContent>(localStorage.getItem("simsekoglu_site_content_v1"));
  if (legacyV1) return legacyV1;

  return defaultSiteContent;
}

export function writeSiteContent(content: SiteContent): void {
  writeStorage(STORAGE_KEYS.siteContent, content);
}

export function readLocale(): Locale {
  if (!canUseStorage()) return "tr";
  const locale = localStorage.getItem(STORAGE_KEYS.locale);
  return locale === "en" ? "en" : "tr";
}

export function writeLocale(locale: Locale): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEYS.locale, locale);
}

export function readQuoteRequests(): QuoteRequest[] {
  return readStorage<QuoteRequest[]>(STORAGE_KEYS.quoteRequests, []);
}

export function writeQuoteRequests(requests: QuoteRequest[]): void {
  writeStorage(STORAGE_KEYS.quoteRequests, requests);
}

export function clearLegacyUserStorage(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem("simsekoglu_user_accounts_v1");
  localStorage.removeItem("simsekoglu_user_accounts_v2");
  localStorage.removeItem("simsekoglu_auth_session_v1");
}
