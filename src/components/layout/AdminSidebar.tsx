import Link from "next/link";

type AdminSidebarProps = {
  admin?: boolean;
};

export function AdminSidebar({ admin = false }: AdminSidebarProps) {
  const links = admin
    ? [
        { href: "/admin", label: "Overview" },
        { href: "/admin/users", label: "Users" },
        { href: "/admin/listings", label: "Listings" },
        { href: "/admin/payments", label: "Payments" },
        { href: "/admin/promotions", label: "Promotions" },
        { href: "/admin/disputes", label: "Disputes" },
        { href: "/admin/enquiries", label: "Enquiries" },
        { href: "/dashboard/notifications", label: "Notifications" },
        { href: "/admin/settings", label: "Settings" },
        { href: "/dashboard/alerts", label: "Listing Alerts" },
        { href: "/dashboard/profile", label: "Profile" },
      ]
    : [
        { href: "/dashboard", label: "Overview" },
        { href: "/dashboard/listings", label: "My Listings" },
        { href: "/dashboard/notifications", label: "Notifications" },
        { href: "/dashboard/payments", label: "Payments" },
        { href: "/dashboard/disputes", label: "Disputes" },
        { href: "/dashboard/enquiries", label: "Enquiries" },
        { href: "/dashboard/alerts", label: "Listing Alerts" },
        { href: "/dashboard/saved", label: "Saved" },
        { href: "/dashboard/profile", label: "Profile" },
      ];

  return (
    <aside className="w-full border-r border-(--border) bg-(--surface) p-4 md:w-64">
      <h2 className="mb-4 font-display text-3xl text-(--primary)">{admin ? "Admin" : "Dashboard"}</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="block rounded-lg px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--accent-light) hover:text-(--primary)">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
