"use client";

import { useAudioStore } from "@/state/useAudioStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "./ThemeToggle";
import type { AudioSourceType } from "@/types/audio";

interface TopBarProps {
  onToggle: () => void;
  onSnapshot?: () => void;
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
      <path d="m6 10 3-3 3 3 3-3 3 3" />
    </svg>
  );
}

export function TopBar({ onToggle, onSnapshot }: TopBarProps) {
  const {
    isRunning,
    devices,
    selectedDeviceId,
    sourceType,
    gain,
    stats,
    setSelectedDeviceId,
    setSourceType,
    setGain,
  } = useAudioStore();

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card/30 backdrop-blur border border-border/50 rounded-xl flex-wrap">
      <Button
        onClick={onToggle}
        variant={isRunning ? "destructive" : "default"}
        size="sm"
        className="min-w-[90px] font-semibold"
      >
        {isRunning ? "Stop" : "Start"}
      </Button>

      {/* Source type selector */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Source</Label>
        <Select
          value={sourceType}
          onValueChange={(v) => {
            if (v) setSourceType(v as AudioSourceType);
          }}
        >
          <SelectTrigger className="h-8 w-[170px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="microphone">
              <span className="flex items-center gap-1.5">
                <MicIcon className="h-3.5 w-3.5" />
                Microphone
              </span>
            </SelectItem>
            <SelectItem value="system">
              <span className="flex items-center gap-1.5">
                <MonitorIcon className="h-3.5 w-3.5" />
                System Audio
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Microphone device selector -- only shown for mic source */}
      {sourceType === "microphone" && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Device</Label>
          <Select
            value={selectedDeviceId || "default"}
            onValueChange={(v) => setSelectedDeviceId(v === "default" || v === null ? "" : v)}
          >
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {devices.map((d) => (
                <SelectItem key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* System audio hint */}
      {sourceType === "system" && !isRunning && (
        <span className="text-[10px] text-muted-foreground max-w-[200px] leading-tight">
          Click Start to open the browser picker. Check &quot;Share audio&quot; to capture system sound.
        </span>
      )}

      {onSnapshot && (
        <Button
          onClick={onSnapshot}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <CameraIcon className="h-3.5 w-3.5" />
          Snapshot
        </Button>
      )}

      {/* Quick gain slider */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <Label className="text-xs text-muted-foreground">Vol</Label>
        <Slider
          value={[gain]}
          onValueChange={(v) => setGain(Array.isArray(v) ? v[0] : v)}
          min={0}
          max={5}
          step={0.1}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground font-mono w-8 text-right">
          {gain.toFixed(1)}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle + Stats badges */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {stats.actualSampleRate > 0 && (
          <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
            {(stats.actualSampleRate / 1000).toFixed(1)} kHz
          </Badge>
        )}
        {stats.latency > 0 && (
          <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
            {stats.latency.toFixed(1)} ms
          </Badge>
        )}
        {stats.frameRate > 0 && (
          <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
            {stats.frameRate} fps
          </Badge>
        )}
        <Badge
          variant={isRunning ? "default" : "outline"}
          className="text-[10px] px-2 py-0.5"
        >
          {isRunning
            ? sourceType === "system" ? "SYSTEM" : "LIVE"
            : "IDLE"}
        </Badge>
      </div>
    </div>
  );
}
