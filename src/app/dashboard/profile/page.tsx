"use client";

import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Camera, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatListingTypeLabel, formatPropertyTypeLabel, formatSavedAlertField } from "@/lib/search-preferences";
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
  id: string;
  createdAt: string;
  query: string | null;
  city: string | null;
  suburb: string | null;
  propertyType: string | null;
  listingType: string | null;
  lastRecommendationSentAt: string | null;
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
  const [avatarInputKey, setAvatarInputKey] = useState(0);
  const [profile, setProfile] = useState<ProfileData>({
    name: "", email: "", churchName: "", denomination: "", phone: "", whatsapp: "", avatar: "", avatarThumb: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertPreferences, setAlertPreferences] = useState<AlertPreference[]>([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [deletingAlertId, setDeletingAlertId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/profile").then(async (r) => {
        if (r.status === 401) {
          router.replace("/signin?callbackUrl=/dashboard/profile");
          return null;
        }
        return r.json();
      }),
      fetch("/api/users/search-preferences?page=1&pageSize=4")
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

        const preferences = Array.isArray(preferenceData?.preferences) ? preferenceData.preferences : [];
        setAlertPreferences(preferences);
        setTotalAlerts(preferenceData?.pagination?.totalItems ?? preferences.length);
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

  async function handleAvatarRemove() {
    if (!profile.avatar && !profile.avatarThumb) {
      return;
    }

    setUploadingAvatar(true);
    try {
      const saveRes = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: "", avatarThumb: "" }),
      });

      if (saveRes.status === 401) {
        router.replace("/signin?callbackUrl=/dashboard/profile");
        return;
      }

      if (!saveRes.ok) {
        throw new Error("Could not remove avatar");
      }

      setProfile((prev) => ({
        ...prev,
        avatar: "",
        avatarThumb: "",
      }));
      await update({ image: null });
      setAvatarInputKey((prev) => prev + 1);
      toast.success("Avatar removed");
    } catch (error) {
      console.error(error);
      toast.error("Could not remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleDeleteAlert(alertId: string) {
    const confirmed = window.confirm("Delete this saved listing alert? You will stop receiving matching alert emails for it.");
    if (!confirmed) {
      return;
    }

    setDeletingAlertId(alertId);
    try {
      const res = await fetch(`/api/users/search-preferences/${alertId}`, { method: "DELETE" });
      if (res.status === 401) {
        router.replace("/signin?callbackUrl=/dashboard/profile");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to delete alert");
      }
      setAlertPreferences((prev) => prev.filter((alert) => alert.id !== alertId));
      setTotalAlerts((prev) => Math.max(prev - 1, 0));
      toast.success("Alert deleted");
    } catch {
      toast.error("Could not delete alert");
    } finally {
      setDeletingAlertId(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-foreground">Profile Settings</h1>
      <div className="rounded-(--radius) border border-(--border) bg-white p-6">
        <p className="mb-4 text-sm font-medium text-foreground">Avatar Photo</p>
        <div className="rounded-[20px] border border-(--border-subtle) bg-(--surface-raised) p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-4">
            {profile.avatarThumb || profile.avatar ? (
              <Image
                src={profile.avatarThumb || profile.avatar}
                alt="Profile avatar"
                width={88}
                height={88}
                className="h-[88px] w-[88px] rounded-full border border-(--border) object-cover shadow-(--shadow-sm)"
              />
            ) : (
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border border-(--border) bg-(--accent-light) text-sm font-semibold text-(--primary)">
                {profile.name?.slice(0, 2).toUpperCase() || "CS"}
              </div>
            )}

            <div className="min-w-[220px] flex-1 space-y-2">
              <p className="text-sm font-semibold text-foreground">{profile.name || "Your profile"}</p>
              <p className="text-xs text-(--text-muted)">Upload a square photo for the cleanest result. Max size 8MB.</p>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-(--border) bg-white px-4 text-sm font-medium text-(--primary) shadow-(--shadow-sm) transition-colors hover:bg-(--primary-soft)">
                  <Camera className="h-4 w-4" />
                  {uploadingAvatar ? "Uploading..." : profile.avatar || profile.avatarThumb ? "Change Photo" : "Upload Photo"}
                  <input
                    key={avatarInputKey}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
                {(profile.avatar || profile.avatarThumb) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 min-w-0 rounded-full border border-(--border) px-4 text-(--text-secondary)"
                    onClick={handleAvatarRemove}
                    disabled={uploadingAvatar}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
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
          <h2 className="text-lg font-semibold text-foreground">Manage Listing Alerts</h2>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/alerts")}>Edit Alerts</Button>
        </div>

        {alertsLoading ? (
          <p className="text-sm text-(--text-muted)">Loading alert settings...</p>
        ) : alertPreferences.length ? (
          <div className="space-y-3">
            <p className="text-sm text-(--text-secondary)">
              {totalAlerts} saved alert{totalAlerts === 1 ? "" : "s"}. Showing the most recent {alertPreferences.length}.
            </p>
            <div className="space-y-3">
              {alertPreferences.map((alert) => (
                <div key={alert.id} className="rounded-[20px] border border-(--border) bg-(--surface-raised) p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid gap-2 text-sm text-(--text-secondary) md:grid-cols-2">
                      <p><strong className="text-foreground">Suburb:</strong> {formatSavedAlertField(alert.suburb)}</p>
                      <p><strong className="text-foreground">City:</strong> {formatSavedAlertField(alert.city)}</p>
                      <p><strong className="text-foreground">Property Type:</strong> {formatPropertyTypeLabel(alert.propertyType)}</p>
                      <p><strong className="text-foreground">Listing Type:</strong> {formatListingTypeLabel(alert.listingType)}</p>
                      <p className="md:col-span-2"><strong className="text-foreground">Keyword:</strong> {formatSavedAlertField(alert.query)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleDeleteAlert(alert.id)}
                      disabled={deletingAlertId === alert.id}
                    >
                      {deletingAlertId === alert.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {totalAlerts > alertPreferences.length ? (
              <p className="text-sm text-(--text-muted)">Open Alerts to view and manage the full list.</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-(--text-muted)">No active listing alerts. Create one from Alerts.</p>
        )}
      </div>
    </div>
  );
}
