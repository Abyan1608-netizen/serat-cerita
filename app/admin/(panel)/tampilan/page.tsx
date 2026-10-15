import PageHeader from "@/components/admin/PageHeader";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { requireAdmin } from "@/lib/auth";
import { resolveSettings } from "@/lib/settings";

export const metadata = { title: "Tampilan & Isi" };

export default async function AppearancePage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("store_settings").select("data").eq("id", 1).maybeSingle();

  return (
    <>
      <PageHeader
        title="Tampilan & Isi"
        description="Ubah tulisan, foto, warna, font, dan ongkir website. Tekan Simpan, perubahan langsung tampil."
      />
      <SettingsEditor initial={resolveSettings(data?.data)} />
    </>
  );
}
