"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type CronStatus = {
  lastRunAt: string | null;
  lastRunSource: string | null;
  lastRunStatus: string | null;
  lastRunProcessed: number;
  lastRunMatchedPreferences: number;
  lastRunEmailsSent: number;
  lastRunError: string | null;
  shouldAllowManualRun: boolean;
};

export function CronRecommendationsStatus() {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<CronStatus | null>(null);

  async function loadStatus() {
    setLoading(true);
    const res = await fetch("/api/admin/cron/recommendations/status", { cache: "no-store" });
    setLoading(false);

    if (!res.ok) {
      toast.error("Could not load cron status");
      return;
    }

    const payload = await res.json();
    setStatus(payload);
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function handleManualRun() {
    setRunning(true);
    const res = await fetch("/api/admin/cron/recommendations/run", { method: "POST" });
    setRunning(false);

    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(payload?.error ?? "Could not run cron manually");
      await loadStatus();
      return;
    }

    toast.success(`Cron completed. Processed ${payload?.processed ?? 0}, emails sent ${payload?.emailsSent ?? 0}.`);
    await loadStatus();
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl text-[var(--text-primary)]">Recommendations Cron</h2>
        {status?.shouldAllowManualRun ? (
          <Button type="button" variant="secondary" onClick={handleManualRun} disabled={running || loading}>
            {running ? "Running..." : "Run Manually"}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading cron status...</p>
      ) : status ? (
        <div className="grid gap-2 text-sm text-[var(--text-secondary)] md:grid-cols-2">
          <p><strong>Last run:</strong> {status.lastRunAt ? new Date(status.lastRunAt).toLocaleString() : "Never"}</p>
          <p><strong>Status:</strong> {status.lastRunStatus ?? "unknown"}</p>
          <p><strong>Source:</strong> {status.lastRunSource ?? "-"}</p>
          <p><strong>Processed alerts:</strong> {status.lastRunProcessed}</p>
          <p><strong>Matched alerts:</strong> {status.lastRunMatchedPreferences}</p>
          <p><strong>Emails sent:</strong> {status.lastRunEmailsSent}</p>
          {status.lastRunError ? <p className="md:col-span-2"><strong>Error:</strong> {status.lastRunError}</p> : null}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">No status available yet.</p>
      )}
    </Card>
  );
}