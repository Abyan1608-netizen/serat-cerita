import { CheckCircle2, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { AdminAccounts, ChangePassword, TelegramConnect } from "@/components/admin/SettingsPanels";
import PageHeader from "@/components/admin/PageHeader";
import { adminCard } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { isMidtransConfigured, isMidtransProduction } from "@/lib/midtrans";
import { isTelegramConfigured } from "@/lib/telegram";

export const metadata = { title: "Pengaturan" };

function Status({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 py-2.5 text-sm">
      {ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /> : <CircleAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />}
      <span>{children}</span>
    </li>
  );
}

export default async function SettingsPage() {
  const { supabase, admin } = await requireAdmin();
  const [{ data: privateSettings }, { data: admins }] = await Promise.all([
    supabase.from("private_settings").select("telegram_chat_id").eq("id", 1).maybeSingle(),
    supabase.from("admins").select("user_id, email, created_at").order("created_at"),
  ]);
  const midtrans = isMidtransConfigured();
  const telegramToken = isTelegramConfigured();
  const chatId = privateSettings?.telegram_chat_id ?? null;

  return (
    <>
      <PageHeader title="Pengaturan" description="Pembayaran, notifikasi HP, dan akun admin." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={adminCard}>
          <h2 className="font-semibold">Status layanan</h2>
          <ul className="mt-2 divide-y divide-stone-100">
            <Status ok>Database & login (Supabase) terhubung.</Status>
            <Status ok={midtrans}>
              {midtrans ? (
                <>Pembayaran Midtrans aktif — mode <strong>{isMidtransProduction() ? "PRODUKSI (uang sungguhan)" : "SANDBOX (uji coba)"}</strong>.</>
              ) : (
                <>Midtrans belum diatur. Pembeli diarahkan membayar lewat WhatsApp dan Anda mengonfirmasi manual di menu Pesanan.</>
              )}
            </Status>
            <Status ok={telegramToken && Boolean(chatId)}>
              {!telegramToken ? "Bot Telegram belum diatur (TELEGRAM_BOT_TOKEN)." : chatId ? "Notifikasi Telegram aktif." : "Bot Telegram siap, tinggal dihubungkan ke HP Anda (lihat di samping)."}
            </Status>
          </ul>
          {midtrans && (
            <p className="mt-4 rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-600">
              Pastikan di Midtrans Dashboard → Settings → Payment → <em>Notification URL</em> diisi:
              <code className="mt-1 block break-all font-mono text-stone-900">https://&lt;alamat-website-anda&gt;/api/midtrans</code>
            </p>
          )}
        </section>

        <section className={adminCard}>
          <h2 className="font-semibold">Notifikasi pesanan ke HP (Telegram)</h2>
          <TelegramConnect tokenReady={telegramToken} connected={Boolean(chatId)} />
        </section>

        <section className={adminCard}>
          <h2 className="font-semibold">Akun admin</h2>
          <AdminAccounts admins={admins ?? []} currentId={admin.id} />
        </section>

        <section className={adminCard}>
          <h2 className="font-semibold">Ganti password Anda</h2>
          <ChangePassword />
        </section>
      </div>
    </>
  );
}
