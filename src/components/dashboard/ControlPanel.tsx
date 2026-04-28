"use client";

import { useAudioStore } from "@/state/useAudioStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  FFT_SIZES,
  WINDOW_FUNCTIONS,
  SAMPLE_RATES,
  BIT_DEPTHS,
  DISPLAY_MODES,
  COLOR_MAPS,
  FREQUENCY_SCALES,
  type FFTSize,
  type WindowFunctionType,
  type SampleRate,
  type BitDepth,
  type DisplayMode,
  type ColorMap,
  type FrequencyScale,
} from "@/types/audio";

const windowFunctionLabels: Record<WindowFunctionType, string> = {
  rectangular: "Rectangular",
  hamming: "Hamming",
  hanning: "Hanning",
  blackman: "Blackman",
  blackmanHarris: "Blackman-Harris",
  kaiser: "Kaiser",
  triangular: "Triangular",
  flatTop: "Flat Top",
  welch: "Welch",
};

const bitDepthLabels: Record<BitDepth, string> = {
  "8": "8-bit",
  "16": "16-bit",
  "24": "24-bit",
  "32f": "32-bit Float",
};

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-xs text-muted-foreground whitespace-nowrap min-w-[100px]">
        {label}
      </Label>
      <div className="flex-1 max-w-[200px]">{children}</div>
    </div>
  );
}

function ControlSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function ControlPanel() {
  const {
    fftSize,
    windowFunction,
    smoothing,
    sampleRate,
    bitDepth,
    gain,
    kaiserBeta,
    frequencyRange,
    dbRange,
    displayMode,
    frequencyScale,
    colorMap,
    overlap,
    peakHold,
    peakDecayRate,
    showWindowed,
    setFFTSize,
    setWindowFunction,
    setSmoothing,
    setSampleRate,
    setBitDepth,
    setGain,
    setKaiserBeta,
    setFrequencyRange,
    setDbRange,
    setDisplayMode,
    setFrequencyScale,
    setColorMap,
    setOverlap,
    setPeakHold,
    setPeakDecayRate,
    setShowWindowed,
  } = useAudioStore();

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium">Advanced Controls</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Analysis Settings */}
          <ControlSection title="Analysis">
            <ControlRow label="FFT Size">
              <Select
                value={String(fftSize)}
                onValueChange={(v) => setFFTSize(Number(v) as FFTSize)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FFT_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ControlRow>

            <ControlRow label="Window">
              <Select
                value={windowFunction}
                onValueChange={(v) => setWindowFunction(v as WindowFunctionType)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WINDOW_FUNCTIONS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {windowFunctionLabels[w]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ControlRow>

            {windowFunction === "kaiser" && (
              <ControlRow label="Kaiser Beta">
                <div className="flex items-center gap-2">
                  <Slider
                    value={[kaiserBeta]}
                    onValueChange={(v) => setKaiserBeta(Array.isArray(v) ? v[0] : v)}
                    min={0}
                    max={20}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {kaiserBeta.toFixed(1)}
                  </span>
                </div>
              </ControlRow>
            )}

            <ControlRow label="Smoothing">
              <div className="flex items-center gap-2">
                <Slider
                  value={[smoothing]}
                  onValueChange={(v) => setSmoothing(Array.isArray(v) ? v[0] : v)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {smoothing.toFixed(2)}
                </span>
              </div>
            </ControlRow>

            <ControlRow label="Gain">
              <div className="flex items-center gap-2">
                <Slider
                  value={[gain]}
                  onValueChange={(v) => setGain(Array.isArray(v) ? v[0] : v)}
                  min={0}
                  max={5}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {gain.toFixed(1)}x
                </span>
              </div>
            </ControlRow>
          </ControlSection>

          <Separator className="md:hidden" />

          {/* Audio Settings */}
          <ControlSection title="Audio">
            <ControlRow label="Sample Rate">
              <Select
                value={String(sampleRate)}
                onValueChange={(v) => setSampleRate(Number(v) as SampleRate)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_RATES.map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {(r / 1000).toFixed(r % 1000 ? 2 : 0)} kHz
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ControlRow>

            <ControlRow label="Bit Depth">
              <Select
                value={bitDepth}
                onValueChange={(v) => setBitDepth(v as BitDepth)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BIT_DEPTHS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {bitDepthLabels[b]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ControlRow>

            <ControlRow label="Min Freq (Hz)">
              <div className="flex items-center gap-2">
                <Slider
                  value={[frequencyRange.min]}
                  onValueChange={(v) =>
                    setFrequencyRange({ ...frequencyRange, min: Array.isArray(v) ? v[0] : v })
                  }
                  min={20}
                  max={frequencyRange.max - 100}
                  step={10}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {frequencyRange.min}
                </span>
              </div>
            </ControlRow>

            <ControlRow label="Max Freq (Hz)">
              <div className="flex items-center gap-2">
                <Slider
                  value={[frequencyRange.max]}
                  onValueChange={(v) =>
                    setFrequencyRange({ ...frequencyRange, max: Array.isArray(v) ? v[0] : v })
                  }
                  min={frequencyRange.min + 100}
                  max={20000}
                  step={100}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {frequencyRange.max >= 1000
                    ? `${(frequencyRange.max / 1000).toFixed(0)}k`
                    : frequencyRange.max}
                </span>
              </div>
            </ControlRow>
          </ControlSection>

          <Separator className="md:hidden" />

          {/* Display Settings */}
          <ControlSection title="Display">
            <ControlRow label="Mode">
              <Select
                value={displayMode}
                onValueChange={(v) => setDisplayMode(v as DisplayMode)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISPLAY_MODES.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ControlRow>

            <ControlRow label="Freq Scale">
              <Select
                value={frequencyScale}
                onValueChange={(v) => setFrequencyScale(v as FrequencyScale)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_SCALES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ControlRow>

            <ControlRow label="Color Map">
              <Select
                value={colorMap}
                onValueChange={(v) => setColorMap(v as ColorMap)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_MAPS.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ControlRow>

            <ControlRow label="Windowed">
              <Switch checked={showWindowed} onCheckedChange={setShowWindowed} />
            </ControlRow>
          </ControlSection>

          <Separator className="md:hidden" />

          {/* Range & Peak Settings */}
          <ControlSection title="Range & Peak">
            <ControlRow label="dB Floor">
              <div className="flex items-center gap-2">
                <Slider
                  value={[dbRange.floor]}
                  onValueChange={(v) =>
                    setDbRange({ ...dbRange, floor: Array.isArray(v) ? v[0] : v })
                  }
                  min={-150}
                  max={dbRange.ceiling - 5}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {dbRange.floor}
                </span>
              </div>
            </ControlRow>

            <ControlRow label="dB Ceiling">
              <div className="flex items-center gap-2">
                <Slider
                  value={[dbRange.ceiling]}
                  onValueChange={(v) =>
                    setDbRange({ ...dbRange, ceiling: Array.isArray(v) ? v[0] : v })
                  }
                  min={dbRange.floor + 5}
                  max={0}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {dbRange.ceiling}
                </span>
              </div>
            </ControlRow>

            <ControlRow label="Overlap %">
              <div className="flex items-center gap-2">
                <Slider
                  value={[overlap]}
                  onValueChange={(v) => setOverlap(Array.isArray(v) ? v[0] : v)}
                  min={0}
                  max={75}
                  step={5}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {overlap}%
                </span>
              </div>
            </ControlRow>

            <ControlRow label="Peak Hold">
              <Switch checked={peakHold} onCheckedChange={setPeakHold} />
            </ControlRow>

            {peakHold && (
              <ControlRow label="Peak Decay">
                <div className="flex items-center gap-2">
                  <Slider
                    value={[peakDecayRate]}
                    onValueChange={(v) => setPeakDecayRate(Array.isArray(v) ? v[0] : v)}
                    min={0.9}
                    max={0.999}
                    step={0.001}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {peakDecayRate.toFixed(3)}
                  </span>
                </div>
              </ControlRow>
            )}
          </ControlSection>
        </div>
      </CardContent>
    </Card>
  );
}
