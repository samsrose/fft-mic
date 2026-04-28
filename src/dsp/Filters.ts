/**
 * Simple biquad filter coefficient generators for visualization overlay.
 * These generate the frequency response curves; actual audio filtering
 * is handled by the Web Audio API's BiquadFilterNode when needed.
 */

export interface BiquadCoefficients {
  b0: number;
  b1: number;
  b2: number;
  a0: number;
  a1: number;
  a2: number;
}

export function lowPassCoefficients(
  sampleRate: number,
  cutoff: number,
  Q: number = 0.707
): BiquadCoefficients {
  const w0 = (2 * Math.PI * cutoff) / sampleRate;
  const alpha = Math.sin(w0) / (2 * Q);
  const cosW0 = Math.cos(w0);

  return {
    b0: (1 - cosW0) / 2,
    b1: 1 - cosW0,
    b2: (1 - cosW0) / 2,
    a0: 1 + alpha,
    a1: -2 * cosW0,
    a2: 1 - alpha,
  };
}

export function highPassCoefficients(
  sampleRate: number,
  cutoff: number,
  Q: number = 0.707
): BiquadCoefficients {
  const w0 = (2 * Math.PI * cutoff) / sampleRate;
  const alpha = Math.sin(w0) / (2 * Q);
  const cosW0 = Math.cos(w0);

  return {
    b0: (1 + cosW0) / 2,
    b1: -(1 + cosW0),
    b2: (1 + cosW0) / 2,
    a0: 1 + alpha,
    a1: -2 * cosW0,
    a2: 1 - alpha,
  };
}

export function bandPassCoefficients(
  sampleRate: number,
  center: number,
  Q: number = 1
): BiquadCoefficients {
  const w0 = (2 * Math.PI * center) / sampleRate;
  const alpha = Math.sin(w0) / (2 * Q);
  const cosW0 = Math.cos(w0);

  return {
    b0: alpha,
    b1: 0,
    b2: -alpha,
    a0: 1 + alpha,
    a1: -2 * cosW0,
    a2: 1 - alpha,
  };
}

/**
 * Compute the magnitude frequency response of a biquad filter at a given frequency.
 */
export function biquadMagnitudeResponse(
  coeffs: BiquadCoefficients,
  frequency: number,
  sampleRate: number
): number {
  const w = (2 * Math.PI * frequency) / sampleRate;
  const cosW = Math.cos(w);
  const cos2W = Math.cos(2 * w);
  const sinW = Math.sin(w);
  const sin2W = Math.sin(2 * w);

  const { b0, b1, b2, a0, a1, a2 } = coeffs;

  const numRe = b0 + b1 * cosW + b2 * cos2W;
  const numIm = -(b1 * sinW + b2 * sin2W);
  const denRe = a0 + a1 * cosW + a2 * cos2W;
  const denIm = -(a1 * sinW + a2 * sin2W);

  const numMag = Math.sqrt(numRe * numRe + numIm * numIm);
  const denMag = Math.sqrt(denRe * denRe + denIm * denIm);

  return denMag > 1e-10 ? numMag / denMag : 0;
}

export function computeFrequencyResponse(
  coeffs: BiquadCoefficients,
  sampleRate: number,
  numPoints: number = 512
): Float32Array {
  const response = new Float32Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    const freq = (i / numPoints) * (sampleRate / 2);
    const mag = biquadMagnitudeResponse(coeffs, freq, sampleRate);
    response[i] = mag > 1e-10 ? 20 * Math.log10(mag) : -200;
  }
  return response;
}
