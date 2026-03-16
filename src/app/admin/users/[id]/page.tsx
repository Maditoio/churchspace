import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { AdminUserActions } from "@/components/admin/AdminUserActions";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { listings: { include: { images: true }, orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl text-[var(--text-primary)]">User Detail</h1>
        <Link href="/admin/users" className="text-sm text-[var(--primary)] underline">Back to all users</Link>
      </div>

      <div className="rounded-(--radius) border border-(--border) bg-white p-6 space-y-3">
        <div className="grid gap-2 text-sm md:grid-cols-2">
          <p><span className="font-medium">Name:</span> {user.name ?? "-"}</p>
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p><span className="font-medium">Church:</span> {user.churchName ?? "-"}</p>
          <p><span className="font-medium">Denomination:</span> {user.denomination ?? "-"}</p>
          <p><span className="font-medium">Phone:</span> {user.phone ?? "-"}</p>
          <p><span className="font-medium">Role:</span> {user.role}</p>
          <p><span className="font-medium">Status:</span> <span className={user.isActive ? "text-[var(--success)]" : "text-[var(--destructive)]"}>{user.isActive ? "Active" : "Inactive"}</span></p>
          <p><span className="font-medium">Joined:</span> {user.createdAt.toDateString()}</p>
        </div>

        <div className="border-t border-(--border-subtle) pt-4">
          <AdminUserActions userId={user.id} currentRole={user.role} isActive={user.isActive} />
        </div>
      </div>

      {user.listings.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-3xl text-[var(--text-primary)]">Listings ({user.listings.length})</h2>
          <div className="overflow-x-auto rounded-(--radius) border border-(--border) bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-(--surface-raised)"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th></tr></thead>
              <tbody>
                {user.listings.map((listing) => (
                  <tr key={listing.id} className="border-t border-(--border-subtle)">
                    <td className="px-4 py-3"><Link href={`/admin/listings/${listing.id}`} className="text-[var(--primary)] underline">{listing.title}</Link></td>
                    <td className="px-4 py-3">{listing.city}</td>
                    <td className="px-4 py-3"><ListingStatusBadge status={listing.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
