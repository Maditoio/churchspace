import { prisma } from "@/lib/prisma";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Site Settings</h1>
      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}
