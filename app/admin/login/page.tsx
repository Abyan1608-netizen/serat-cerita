import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getAdmin } from "@/lib/auth";

export const metadata = { title: "Masuk" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Masuk Admin</h1>
        <p className="mt-1 text-sm text-stone-500">Kelola toko Serat Cerita.</p>
        <LoginForm />
      </div>
    </div>
  );
}
