import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { adminButton, adminInput, adminLabel } from "@/components/admin/ui";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Buat akun admin pertama" };

async function hasAdmin(): Promise<boolean> {
  await connection();
  const { count } = await createAdminClient()
    .from("admins")
    .select("user_id", { count: "exact", head: true });
  return (count ?? 0) > 0;
}

async function createFirstAdmin(formData: FormData) {
  "use server";
  const ownerEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (await hasAdmin()) redirect("/admin/login");
  if (!ownerEmail || email !== ownerEmail) redirect("/admin/setup?error=email");
  if (password.length < 8) redirect("/admin/setup?error=password");

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) redirect("/admin/setup?error=create");

  await supabase.from("admins").insert({ user_id: data.user.id, email });
  redirect("/admin/login?setup=1");
}

const errors: Record<string, string> = {
  email: "Email harus sama dengan ADMIN_EMAIL yang diatur di Vercel.",
  password: "Password minimal 8 karakter.",
  create: "Akun gagal dibuat. Mungkin email ini sudah terdaftar.",
};

export default async function SetupPage(props: PageProps<"/admin/setup">) {
  if (await hasAdmin()) redirect("/admin/login");
  const error = (await props.searchParams).error;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Buat akun admin pertama</h1>
        <p className="mt-1 text-sm text-stone-500">
          Halaman ini hanya bisa dipakai sekali. Setelah itu, admin lain ditambahkan dari menu Pengaturan.
        </p>
        {!process.env.ADMIN_EMAIL && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Atur dulu variabel <code>ADMIN_EMAIL</code> di Vercel, lalu deploy ulang.
          </p>
        )}
        <form action={createFirstAdmin} className="mt-6 grid gap-4">
          <label className={adminLabel}>
            Email
            <input name="email" type="email" required className={adminInput} />
          </label>
          <label className={adminLabel}>
            Password (minimal 8 karakter)
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className={adminInput} />
          </label>
          {typeof error === "string" && errors[error] && (
            <p role="alert" className="text-sm text-red-700">{errors[error]}</p>
          )}
          <button type="submit" className={adminButton}>Buat akun</button>
        </form>
        <Link href="/admin/login" className="mt-4 block text-center text-sm text-stone-500 underline">
          Sudah punya akun? Masuk
        </Link>
      </div>
    </div>
  );
}
