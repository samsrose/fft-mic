import { type FFTSize, type SampleRate, type AudioSourceType } from "@/types/audio";
import { requestMicrophoneStream, requestSystemAudioStream, stopStream } from "./MicrophoneSource";

export interface AudioEngineNodes {
  context: AudioContext;
  source: MediaStreamAudioSourceNode;
  gain: GainNode;
  analyser: AnalyserNode;
  stream: MediaStream;
}

export class AudioEngine {
  private nodes: AudioEngineNodes | null = null;

  get isRunning(): boolean {
    return this.nodes !== null && this.nodes.context.state === "running";
  }

  get sampleRate(): number {
    return this.nodes?.context.sampleRate ?? 0;
  }

  get analyser(): AnalyserNode | null {
    return this.nodes?.analyser ?? null;
  }

  get gainNode(): GainNode | null {
    return this.nodes?.gain ?? null;
  }

  get context(): AudioContext | null {
    return this.nodes?.context ?? null;
  }

  async start(
    deviceId?: string,
    fftSize: FFTSize = 2048,
    sampleRate?: SampleRate,
    smoothing: number = 0.8,
    sourceType: AudioSourceType = "microphone"
  ): Promise<void> {
    if (this.nodes) {
      await this.stop();
    }

    const stream =
      sourceType === "system"
        ? await requestSystemAudioStream()
        : await requestMicrophoneStream(deviceId, sampleRate);

    const context = new AudioContext({
      sampleRate: sampleRate ?? undefined,
    });

    // Handle browser autoplay policy
    if (context.state === "suspended") {
      await context.resume();
    }

    const source = context.createMediaStreamSource(stream);
    const gain = context.createGain();
    const analyser = context.createAnalyser();

    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = smoothing;
    analyser.minDecibels = -120;
    analyser.maxDecibels = -10;

    source.connect(gain);
    gain.connect(analyser);

    this.nodes = { context, source, gain, analyser, stream };
  }

  async stop(): Promise<void> {
    if (!this.nodes) return;

    this.nodes.source.disconnect();
    this.nodes.gain.disconnect();
    this.nodes.analyser.disconnect();
    stopStream(this.nodes.stream);

    if (this.nodes.context.state !== "closed") {
      await this.nodes.context.close();
    }

    this.nodes = null;
  }

  setFFTSize(size: FFTSize): void {
    if (this.nodes) {
      this.nodes.analyser.fftSize = size;
    }
  }

  setSmoothing(value: number): void {
    if (this.nodes) {
      this.nodes.analyser.smoothingTimeConstant = Math.max(0, Math.min(1, value));
    }
  }

  setGain(value: number): void {
    if (this.nodes) {
      this.nodes.gain.gain.value = value;
    }
  }

  setDbRange(floor: number, ceiling: number): void {
    if (this.nodes) {
      this.nodes.analyser.minDecibels = floor;
      this.nodes.analyser.maxDecibels = ceiling;
    }
  }

  getTimeDomainData(): Float32Array {
    if (!this.nodes) return new Float32Array(0);
    const data = new Float32Array(this.nodes.analyser.fftSize);
    this.nodes.analyser.getFloatTimeDomainData(data);
    return data;
  }

  getFrequencyData(): Float32Array {
    if (!this.nodes) return new Float32Array(0);
    const data = new Float32Array(this.nodes.analyser.frequencyBinCount);
    this.nodes.analyser.getFloatFrequencyData(data);
    return data;
  }

  getByteFrequencyData(): Uint8Array {
    if (!this.nodes) return new Uint8Array(0);
    const data = new Uint8Array(this.nodes.analyser.frequencyBinCount);
    this.nodes.analyser.getByteFrequencyData(data);
    return data;
  }

  getStats(): { sampleRate: number; latency: number; bufferSize: number } {
    if (!this.nodes) return { sampleRate: 0, latency: 0, bufferSize: 0 };
    return {
      sampleRate: this.nodes.context.sampleRate,
      latency: (this.nodes.context.baseLatency ?? 0) * 1000,
      bufferSize: this.nodes.analyser.fftSize,
    };
  }
}
