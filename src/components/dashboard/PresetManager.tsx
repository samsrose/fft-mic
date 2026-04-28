"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DbPreset } from "@/types/db";

interface PresetManagerProps {
  presets: DbPreset[];
  loading: boolean;
  onSave: (name: string, description?: string) => Promise<unknown>;
  onLoad: (preset: DbPreset) => void;
  onDelete: (id: string) => Promise<void>;
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export function PresetManager({
  presets,
  loading,
  onSave,
  onLoad,
  onDelete,
}: PresetManagerProps) {
  const [saving, setSaving] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSave = async () => {
    if (!presetName.trim()) return;
    setSaving(true);
    try {
      await onSave(presetName.trim());
      setPresetName("");
      setShowForm(false);
    } catch {
      console.error("Failed to save preset");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Presets</CardTitle>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setShowForm(!showForm)}
          >
            <SaveIcon className="h-3 w-3" />
            {showForm ? "Cancel" : "Save Current"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {showForm && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name..."
              className="flex-1 h-7 px-2 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
            <Button
              variant="default"
              size="xs"
              onClick={handleSave}
              disabled={saving || !presetName.trim()}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}

        {loading ? (
          <p className="text-xs text-muted-foreground">Loading presets...</p>
        ) : presets.length === 0 ? (
          <p className="text-xs text-muted-foreground">No presets saved yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <div
                key={p.id}
                className="group flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors"
              >
                <button
                  onClick={() => onLoad(p)}
                  className="text-xs font-medium hover:underline focus:outline-none"
                >
                  {p.name}
                </button>
                {p.is_default && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0">
                    default
                  </Badge>
                )}
                {!p.is_default && (
                  <button
                    onClick={() => onDelete(p.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
