"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import type { UserRole } from "@/types";

const ROLES: UserRole[] = ["USER", "AGENT", "SUPER_ADMIN"];

export function AdminUserActions({ userId, currentRole, isActive }: { userId: string; currentRole: UserRole; isActive: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(currentRole);
  const [loading, setLoading] = useState(false);

  async function save(newRole: UserRole, newActive: boolean) {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole, isActive: newActive }),
    });
    setLoading(false);
    if (res.ok) { toast.success("User updated"); router.refresh(); }
    else toast.error("Update failed");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        className="h-11 rounded-[8px] border border-[var(--border)] px-3 text-sm"
        disabled={loading}
      >
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <Button variant="accent" disabled={loading} onClick={() => save(role, isActive)}>Save Role</Button>
      {isActive ? (
        <Button variant="danger" disabled={loading} onClick={() => save(role, false)}>Deactivate</Button>
      ) : (
        <Button disabled={loading} onClick={() => save(role, true)}>Activate</Button>
      )}
    </div>
  );
}
