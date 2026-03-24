"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type SettingsItem = {
  id: string;
  key: string;
  value: string;
};

export function AdminSettingsForm({ initialSettings }: { initialSettings: SettingsItem[] }) {
  const [settings, setSettings] = useState<SettingsItem[]>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [runningCron, setRunningCron] = useState(false);

  const hasEmptyKeys = useMemo(() => settings.some((item) => item.key.trim().length === 0), [settings]);

  function updateItem(id: string, field: "key" | "value", value: string) {
    setSettings((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setSettings((prev) => [...prev, { id: `new-${Date.now()}`, key: "", value: "" }]);
  }

  async function handleSave() {
    if (hasEmptyKeys) {
      toast.error("Every setting needs a key.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setSaving(false);

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      toast.error(payload?.error ?? "Could not save settings");
      return;
    }

    const payload = await res.json();
    setSettings(payload.settings ?? settings);
    toast.success("Settings updated");
  }

  async function handleTriggerRecommendationsCron() {
    setRunningCron(true);
    const res = await fetch("/api/admin/cron/recommendations/trigger?troubleshoot=1", {
      method: "POST",
    });
    setRunningCron(false);

    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(payload?.error ?? "Could not trigger recommendations cron");
      return;
    }

    toast.success(`Cron completed. Processed ${payload?.processed ?? 0}, emails sent ${payload?.emailsSent ?? 0}.`);
  }

  return (
    <div className="space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-white p-6">
      {settings.length ? (
        settings.map((setting) => (
          <div key={setting.id} className="grid gap-3 md:grid-cols-2">
            <Input
              value={setting.key}
              onChange={(event) => updateItem(setting.id, "key", event.target.value)}
              placeholder="setting.key"
            />
            <Input
              value={setting.value}
              onChange={(event) => updateItem(setting.id, "value", event.target.value)}
              placeholder="setting value"
            />
          </div>
        ))
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">No settings stored yet.</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={addItem}>Add Setting</Button>
        <Button type="button" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
        <Button type="button" variant="ghost" onClick={handleTriggerRecommendationsCron} disabled={runningCron}>
          {runningCron ? "Running Cron..." : "Run Recommendations Cron"}
        </Button>
      </div>
    </div>
  );
}