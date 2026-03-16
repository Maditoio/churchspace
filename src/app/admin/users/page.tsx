import { UsersTable } from "@/components/admin/UsersTable";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Users Management</h1>
      <UsersTable users={users} />
    </div>
  );
}
