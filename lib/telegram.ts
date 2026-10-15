import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

async function callTelegram(method: string, body?: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN belum diatur");

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.description ?? "Telegram error");
  return data.result;
}

async function getChatId(): Promise<string | null> {
  const { data } = await createAdminClient()
    .from("private_settings")
    .select("telegram_chat_id")
    .eq("id", 1)
    .maybeSingle();
  return data?.telegram_chat_id ?? process.env.TELEGRAM_CHAT_ID ?? null;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Kirim notifikasi ke HP pemilik toko. Tidak pernah melempar error —
 * pesanan tetap berjalan walau Telegram sedang bermasalah.
 */
export async function notifyOwner(lines: string[]): Promise<boolean> {
  try {
    if (!isTelegramConfigured()) return false;
    const chatId = await getChatId();
    if (!chatId) return false;

    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: lines.map(escapeHtml).join("\n").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    return true;
  } catch (error) {
    console.error("Gagal mengirim notifikasi Telegram:", error);
    return false;
  }
}

/** Cari chat ID dari pesan terakhir yang dikirim ke bot (setelah /start). */
export async function detectChatId(): Promise<{ id: string; name: string } | null> {
  const updates: Array<{
    message?: { chat: { id: number; first_name?: string; username?: string; title?: string } };
  }> = await callTelegram("getUpdates", { limit: 20 });

  for (let i = updates.length - 1; i >= 0; i--) {
    const chat = updates[i].message?.chat;
    if (chat) {
      return {
        id: String(chat.id),
        name: chat.first_name ?? chat.title ?? chat.username ?? String(chat.id),
      };
    }
  }
  return null;
}

export async function sendTestMessage(chatId: string): Promise<void> {
  await callTelegram("sendMessage", {
    chat_id: chatId,
    text: "✅ Notifikasi Serat Cerita aktif. Setiap pesanan baru akan muncul di sini.",
  });
}
