import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseBrowserClient = SupabaseClient | null;

let browserClient: SupabaseBrowserClient = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

export function getSupabaseConfigWarning(): string | null {
  if (isSupabaseConfigured()) return null;
  return "Supabase bağlantısı eksik. Lütfen .env.local bilgilerini kontrol edin.";
}

export function getSupabaseBrowserClient(): SupabaseBrowserClient {
  if (typeof window === "undefined") return null;
  if (browserClient) return browserClient;
  if (!isSupabaseConfigured()) return null;

  browserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: { persistSession: true, autoRefreshToken: true }
    }
  );
  return browserClient;
}
