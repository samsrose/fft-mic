import { type WindowFunctionType } from "@/types/audio";

export function rectangular(N: number): Float32Array {
  return new Float32Array(N).fill(1);
}

export function hamming(N: number): Float32Array {
  const w = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    w[n] = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1));
  }
  return w;
}

export function hanning(N: number): Float32Array {
  const w = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    w[n] = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
  }
  return w;
}

export function blackman(N: number): Float32Array {
  const w = new Float32Array(N);
  const a0 = 0.42;
  const a1 = 0.5;
  const a2 = 0.08;
  for (let n = 0; n < N; n++) {
    const t = (2 * Math.PI * n) / (N - 1);
    w[n] = a0 - a1 * Math.cos(t) + a2 * Math.cos(2 * t);
  }
  return w;
}

export function blackmanHarris(N: number): Float32Array {
  const w = new Float32Array(N);
  const a0 = 0.35875;
  const a1 = 0.48829;
  const a2 = 0.14128;
  const a3 = 0.01168;
  for (let n = 0; n < N; n++) {
    const t = (2 * Math.PI * n) / (N - 1);
    w[n] = a0 - a1 * Math.cos(t) + a2 * Math.cos(2 * t) - a3 * Math.cos(3 * t);
  }
  return w;
}

function besselI0(x: number): number {
  let sum = 1;
  let term = 1;
  for (let k = 1; k <= 25; k++) {
    term *= (x / (2 * k)) * (x / (2 * k));
    sum += term;
    if (term < 1e-12 * sum) break;
  }
  return sum;
}

export function kaiser(N: number, beta: number = 5): Float32Array {
  const w = new Float32Array(N);
  const denom = besselI0(beta);
  for (let n = 0; n < N; n++) {
    const ratio = (2 * n) / (N - 1) - 1;
    w[n] = besselI0(beta * Math.sqrt(1 - ratio * ratio)) / denom;
  }
  return w;
}

export function triangular(N: number): Float32Array {
  const w = new Float32Array(N);
  const half = (N - 1) / 2;
  for (let n = 0; n < N; n++) {
    w[n] = 1 - Math.abs((n - half) / half);
  }
  return w;
}

export function flatTop(N: number): Float32Array {
  const w = new Float32Array(N);
  const a0 = 0.21557895;
  const a1 = 0.41663158;
  const a2 = 0.277263158;
  const a3 = 0.083578947;
  const a4 = 0.006947368;
  for (let n = 0; n < N; n++) {
    const t = (2 * Math.PI * n) / (N - 1);
    w[n] = a0 - a1 * Math.cos(t) + a2 * Math.cos(2 * t) - a3 * Math.cos(3 * t) + a4 * Math.cos(4 * t);
  }
  return w;
}

export function welch(N: number): Float32Array {
  const w = new Float32Array(N);
  const half = (N - 1) / 2;
  for (let n = 0; n < N; n++) {
    const ratio = (n - half) / half;
    w[n] = 1 - ratio * ratio;
  }
  return w;
}

const windowGenerators: Record<WindowFunctionType, (N: number, beta?: number) => Float32Array> = {
  rectangular,
  hamming,
  hanning,
  blackman,
  blackmanHarris,
  kaiser,
  triangular,
  flatTop,
  welch,
};

const windowCache = new Map<string, Float32Array>();

export function getWindowCoefficients(
  type: WindowFunctionType,
  N: number,
  beta: number = 5
): Float32Array {
  const key = `${type}_${N}_${beta}`;
  const cached = windowCache.get(key);
  if (cached) return cached;

  const gen = windowGenerators[type];
  const coeffs = type === "kaiser" ? gen(N, beta) : gen(N);
  windowCache.set(key, coeffs);
  return coeffs;
}

export function applyWindow(signal: Float32Array, coefficients: Float32Array): Float32Array {
  const result = new Float32Array(signal.length);
  const len = Math.min(signal.length, coefficients.length);
  for (let i = 0; i < len; i++) {
    result[i] = signal[i] * coefficients[i];
  }
  return result;
}
