import type { UserRole } from "@/types";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  churchName: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
};

export function UsersTable({ users }: { users: UserRow[] }) {
  return (
    <div className="overflow-x-auto rounded-(--radius) border border-(--border) bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-(--surface-raised) text-(--text-secondary)">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Church</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-(--border-subtle)">
              <td className="px-4 py-3">{user.name ?? "-"}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.churchName ?? "-"}</td>
              <td className="px-4 py-3">{user.role}</td>
              <td className="px-4 py-3">{user.isActive ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
