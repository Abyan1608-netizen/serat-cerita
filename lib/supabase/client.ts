import { createBrowserClient } from "@supabase/ssr";

/** Klien Supabase untuk komponen di browser (login & unggah foto admin). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
