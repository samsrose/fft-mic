"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DbSession } from "@/types/db";

export function SessionHistory() {
  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      if (!res.ok) return;
      const data: DbSession[] = await res.json();
      setSessions(data);
    } catch {
      /* swallow */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 15000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium">Session History</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No sessions recorded yet. Start the analyzer to begin tracking.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {sessions.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-md hover:bg-muted/40 transition-colors"
              >
                <Badge
                  variant={s.ended_at ? "secondary" : "default"}
                  className="text-[9px] px-1.5 py-0 min-w-[50px] text-center"
                >
                  {s.ended_at ? "done" : "active"}
                </Badge>
                <span className="text-muted-foreground">
                  {formatDate(s.started_at)}
                </span>
                <span className="font-mono">
                  {formatDuration(s.duration_seconds)}
                </span>
                {s.peak_db !== null && (
                  <span className="text-muted-foreground font-mono">
                    peak: {s.peak_db.toFixed(1)} dB
                  </span>
                )}
                {s.peak_frequency !== null && (
                  <span className="text-muted-foreground font-mono">
                    @{s.peak_frequency.toFixed(0)} Hz
                  </span>
                )}
                <span className="text-muted-foreground/60 capitalize">
                  {s.source_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
