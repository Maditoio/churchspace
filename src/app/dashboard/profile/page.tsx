"use client";

import Image from "next/image";
import { upload } from "@vercel/blob/client";
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
  avatar: string;
  avatarThumb: string;
};

type AlertPreference = {
  query: string | null;
  city: string | null;
  suburb: string | null;
  propertyType: string | null;
  listingType: string | null;
};

const MAX_AVATAR_BYTES = 8 * 1024 * 1024;
const THUMB_SIZE = 160;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function createAvatarThumb(file: File, size: number) {
  const src = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read selected image"));
      img.src = src;
    });

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not prepare thumbnail canvas");
    }

    const srcMin = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = (image.naturalWidth - srcMin) / 2;
    const sy = (image.naturalHeight - srcMin) / 2;

    context.drawImage(image, sx, sy, srcMin, srcMin, 0, 0, size, size);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.82);
    });

    if (!blob) {
      throw new Error("Could not generate thumbnail image");
    }

    return new File([blob], `thumb-${sanitizeFileName(file.name)}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(src);
  }
}

async function uploadAvatarFile(file: File, kind: "original" | "thumb") {
  const prefix = kind === "thumb" ? "avatars/thumbs" : "avatars";
  const pathname = `${prefix}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const uploaded = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    multipart: file.size > 5 * 1024 * 1024,
    ...(file.type ? { contentType: file.type } : {}),
  });

  return uploaded.url;
}

export default function ProfilePage() {
  const { update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    name: "", email: "", churchName: "", denomination: "", phone: "", whatsapp: "", avatar: "", avatarThumb: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertPreference, setAlertPreference] = useState<AlertPreference | null>(null);
  const [deletingAlert, setDeletingAlert] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/profile").then(async (r) => {
        if (r.status === 401) {
          router.replace("/signin?callbackUrl=/dashboard/profile");
          return null;
        }
        return r.json();
      }),
      fetch("/api/users/search-preferences")
        .then(async (r) => {
          if (r.status === 401) {
            router.replace("/signin?callbackUrl=/dashboard/profile");
            return null;
          }
          return r.json();
        })
        .catch(() => null),
    ])
      .then(([profileData, preferenceData]) => {
        if (profileData?.email) {
          setProfile({
            name: profileData.name ?? "",
            email: profileData.email ?? "",
            churchName: profileData.churchName ?? "",
            denomination: profileData.denomination ?? "",
            phone: profileData.phone ?? "",
            whatsapp: profileData.whatsapp ?? "",
            avatar: profileData.avatar ?? "",
            avatarThumb: profileData.avatarThumb ?? "",
          });
        }

        const preference = preferenceData?.preference;
        if (preference) {
          setAlertPreference({
            query: preference.query ?? null,
            city: preference.city ?? null,
            suburb: preference.suburb ?? null,
            propertyType: preference.propertyType ?? null,
            listingType: preference.listingType ?? null,
          });
        } else {
          setAlertPreference(null);
        }
      })
      .catch(() => {})
      .finally(() => {
        setAlertsLoading(false);
      });
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
      await update({ name: profile.name, image: profile.avatarThumb || profile.avatar || null });
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Avatar must be smaller than 8MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      const thumbFile = await createAvatarThumb(file, THUMB_SIZE);
      const [avatarUrl, avatarThumbUrl] = await Promise.all([
        uploadAvatarFile(file, "original"),
        uploadAvatarFile(thumbFile, "thumb"),
      ]);

      setProfile((prev) => ({
        ...prev,
        avatar: avatarUrl,
        avatarThumb: avatarThumbUrl,
      }));

      const saveRes = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarUrl, avatarThumb: avatarThumbUrl }),
      });

      if (!saveRes.ok) {
        throw new Error("Could not save avatar");
      }

      await update({ image: avatarThumbUrl });
      toast.success("Avatar updated");
    } catch (error) {
      console.error(error);
      toast.error("Could not upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleDeleteAlert() {
    const confirmed = window.confirm("Delete your saved listing alert? You will stop receiving alert emails until you create a new alert.");
    if (!confirmed) {
      return;
    }

    setDeletingAlert(true);
    try {
      const res = await fetch("/api/users/search-preferences", { method: "DELETE" });
      if (res.status === 401) {
        router.replace("/signin?callbackUrl=/dashboard/profile");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to delete alert");
      }
      setAlertPreference(null);
      toast.success("Alert deleted");
    } catch {
      toast.error("Could not delete alert");
    } finally {
      setDeletingAlert(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-(--text-primary)">Profile Settings</h1>
      <div className="rounded-(--radius) border border-(--border) bg-white p-6">
        <p className="mb-4 text-sm font-medium text-(--text-primary)">Avatar Photo</p>
        <div className="flex flex-wrap items-center gap-4">
          {profile.avatarThumb || profile.avatar ? (
            <Image
              src={profile.avatarThumb || profile.avatar}
              alt="Profile avatar"
              width={72}
              height={72}
              className="rounded-full border border-(--border) object-cover"
            />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-(--border) bg-(--accent-light) text-xs font-semibold text-(--primary)">
              {profile.name?.slice(0, 2).toUpperCase() || "CS"}
            </div>
          )}
          <div className="space-y-2">
            <Input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} />
            <p className="text-xs text-(--text-muted)">Square thumbnail is generated automatically for fast loading.</p>
          </div>
        </div>
      </div>
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
      <div className="space-y-3 rounded-(--radius) border border-(--border) bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-(--text-primary)">Manage Listing Alerts</h2>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/alerts")}>Edit Alerts</Button>
        </div>

        {alertsLoading ? (
          <p className="text-sm text-(--text-muted)">Loading alert settings...</p>
        ) : alertPreference ? (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm text-(--text-secondary) md:grid-cols-2">
              <p><strong>Suburb:</strong> {alertPreference.suburb ?? "-"}</p>
              <p><strong>City:</strong> {alertPreference.city ?? "-"}</p>
              <p><strong>Property Type:</strong> {alertPreference.propertyType?.replaceAll("_", " ") ?? "-"}</p>
              <p><strong>Listing Type:</strong> {alertPreference.listingType ?? "-"}</p>
              <p className="md:col-span-2"><strong>Keyword:</strong> {alertPreference.query ?? "-"}</p>
            </div>
            <Button type="button" variant="ghost" onClick={handleDeleteAlert} disabled={deletingAlert}>
              {deletingAlert ? "Deleting..." : "Delete Alert"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-(--text-muted)">No active listing alert. Create one from Alerts.</p>
        )}
      </div>
    </div>
  );
}
