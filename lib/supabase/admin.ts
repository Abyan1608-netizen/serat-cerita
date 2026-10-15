import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/config";

/**
 * Klien dengan hak penuh (service role) — HANYA untuk kode server yang
 * sudah memvalidasi input sendiri: membuat pesanan, webhook pembayaran, dll.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diatur");

  return createClient(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
