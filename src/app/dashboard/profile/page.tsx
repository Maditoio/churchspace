"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

type ProfileData = {
  name: string;
  email: string;
  churchName: string;
  denomination: string;
  phone: string;
  whatsapp: string;
};

export default function ProfilePage() {
  const { update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    name: "", email: "", churchName: "", denomination: "", phone: "", whatsapp: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/users/profile")
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/signin?callbackUrl=/dashboard/profile");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.email) {
          setProfile({
            name: data.name ?? "",
            email: data.email ?? "",
            churchName: data.churchName ?? "",
            denomination: data.denomination ?? "",
            phone: data.phone ?? "",
            whatsapp: data.whatsapp ?? "",
          });
        }
      })
        .catch(() => {});
      }, [router]);

  function onChange(field: keyof ProfileData) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.status === 401) {
        router.replace("/signin?callbackUrl=/dashboard/profile");
        return;
      }
      if (!res.ok) throw new Error("Failed to save");
      await update({ name: profile.name });
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-(--text-primary)">Profile Settings</h1>
      <form onSubmit={handleSubmit} className="grid gap-3 rounded-(--radius) border border-(--border) bg-white p-6 md:grid-cols-2">
        <Input value={profile.name} onChange={onChange("name")} placeholder="Full name" />
        <Input value={profile.email} placeholder="Email" disabled />
        <Input value={profile.churchName} onChange={onChange("churchName")} placeholder="Church Name" />
        <Input value={profile.denomination} onChange={onChange("denomination")} placeholder="Denomination" />
        <Input value={profile.phone} onChange={onChange("phone")} placeholder="Phone" />
        <Input value={profile.whatsapp} onChange={onChange("whatsapp")} placeholder="WhatsApp" />
        <Button type="submit" disabled={saving} className="md:col-span-2">
          {saving ? "Saving…" : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
