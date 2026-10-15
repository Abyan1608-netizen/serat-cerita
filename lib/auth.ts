import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Pengguna yang sedang login DAN terdaftar sebagai admin, atau null. */
export const getAdmin = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? { id: user.id, email: user.email ?? "" } : null;
});

/** Wajib dipanggil di setiap halaman & aksi admin. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return { admin, supabase: await createClient() };
}
