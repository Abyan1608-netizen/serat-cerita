import Sidebar from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const { admin } = await requireAdmin();

  return (
    <div className="lg:flex">
      <Sidebar email={admin.email} />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
