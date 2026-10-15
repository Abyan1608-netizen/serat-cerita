"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addAdmin, changePassword, connectTelegram, removeAdmin, testTelegram, type ActionResult } from "@/app/admin/actions";
import { adminButton, adminButtonOutline, adminInput, adminLabel } from "@/components/admin/ui";

function Feedback({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return (
    <p role="status" className={`text-sm ${result.ok ? "text-emerald-700" : "text-red-700"}`}>
      {result.ok ? result.message ?? "Berhasil" : result.error}
    </p>
  );
}

export function TelegramConnect({ tokenReady, connected }: { tokenReady: boolean; connected: boolean }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      setResult(await action());
      router.refresh();
    });

  return (
    <div className="mt-3 grid gap-4 text-sm">
      <ol className="list-decimal space-y-1.5 pl-5 text-stone-600">
        <li>Buka aplikasi Telegram di HP, cari bot yang Anda buat (lihat panduan PANDUAN.md).</li>
        <li>Tekan <strong>Start</strong> atau kirim pesan apa saja ke bot itu.</li>
        <li>Kembali ke sini, tekan <strong>Hubungkan</strong>. Pesan uji akan masuk ke HP Anda.</li>
      </ol>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!tokenReady || pending} onClick={() => run(connectTelegram)} className={adminButton}>
          {connected ? "Hubungkan ulang" : "Hubungkan"}
        </button>
        {connected && (
          <button type="button" disabled={pending} onClick={() => run(testTelegram)} className={adminButtonOutline}>
            Kirim pesan uji
          </button>
        )}
      </div>
      <Feedback result={result} />
    </div>
  );
}

export function AdminAccounts({
  admins,
  currentId,
}: {
  admins: { user_id: string; email: string }[];
  currentId: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-3 grid gap-4">
      <ul className="divide-y divide-stone-100 text-sm">
        {admins.map((a) => (
          <li key={a.user_id} className="flex items-center justify-between gap-3 py-2.5">
            <span className="truncate">{a.email} {a.user_id === currentId && <span className="text-stone-400">(Anda)</span>}</span>
            {a.user_id !== currentId && (
              <button
                type="button"
                aria-label={`Hapus ${a.email}`}
                disabled={pending}
                onClick={() => {
                  if (!confirm(`Hapus akses admin ${a.email}?`)) return;
                  startTransition(async () => {
                    setResult(await removeAdmin(a.user_id));
                    router.refresh();
                  });
                }}
                className="rounded-lg p-1.5 text-red-700 hover:bg-red-50"
              >
                <Trash2 size={15} />
              </button>
            )}
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await addAdmin({ email, password });
            setResult(r);
            if (r.ok) {
              setEmail("");
              setPassword("");
              router.refresh();
            }
          });
        }}
        className="grid gap-3 border-t border-stone-100 pt-4"
      >
        <p className="text-sm font-medium">Tambah admin</p>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={adminInput} />
        <input type="password" required minLength={8} placeholder="Password (min. 8 karakter)" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={adminInput} />
        <button type="submit" disabled={pending} className={`${adminButton} w-fit`}>Tambah</button>
      </form>
      <Feedback result={result} />
    </div>
  );
}

export function ChangePassword() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await changePassword(password);
          setResult(r);
          if (r.ok) setPassword("");
        });
      }}
      className="mt-3 grid gap-3"
    >
      <label className={adminLabel}>
        Password baru
        <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={adminInput} />
      </label>
      <button type="submit" disabled={pending} className={`${adminButton} w-fit`}>Ganti password</button>
      <Feedback result={result} />
    </form>
  );
}
