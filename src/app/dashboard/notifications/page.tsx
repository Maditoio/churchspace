import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { auth } from "@/lib/auth";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

export default async function DashboardNotificationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard/notifications");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const totalNotifications = await prisma.notification.count({ where: { userId: session.user.id } });
  const pagination = getPaginationMeta(totalNotifications, parsePageParam(resolvedSearchParams?.page), PAGE_SIZE);

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--primary-soft) text-(--primary)">
          <Bell className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-5xl text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-(--text-secondary)">Updates about your listings, reviews, payments, and platform activity.</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length ? (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-(--radius) border p-5 ${notification.isRead ? "border-(--border) bg-white" : "border-(--accent)/50 bg-(--accent-light)/30"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">{notification.title}</h2>
                <p className="text-xs text-(--text-secondary)">{notification.createdAt.toLocaleString()}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-(--text-secondary)">{notification.message}</p>
              {notification.reason ? (
                <p className="mt-3 text-sm text-foreground"><span className="font-semibold">Reason:</span> {notification.reason}</p>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-(--radius) border border-(--border) bg-white p-8 text-center text-sm text-(--text-secondary)">
            No notifications yet.
          </div>
        )}
      </div>

      <PaginationControls
        basePath="/dashboard/notifications"
        className="rounded-(--radius) border border-(--border) bg-white"
        currentPage={pagination.currentPage}
        itemLabel="notifications"
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}