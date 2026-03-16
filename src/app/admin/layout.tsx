import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/admin");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-8 md:flex-row md:px-8">
      <AdminSidebar admin />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
