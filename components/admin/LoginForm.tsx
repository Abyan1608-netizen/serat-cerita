"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminButton, adminInput, adminLabel } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // onSubmit (bukan action) agar isian tidak dikosongkan saat password salah.
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    if (error) {
      setError("Email atau password salah.");
      setPending(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <label className={adminLabel}>
        Email
        <input name="email" type="email" required autoComplete="email" className={adminInput} />
      </label>
      <label className={adminLabel}>
        Password
        <input name="password" type="password" required autoComplete="current-password" className={adminInput} />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={pending} className={adminButton}>
        {pending ? "Masuk…" : "Masuk"}
      </button>
    </form>
  );
}
