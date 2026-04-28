/**
 * Cooley-Tukey radix-2 DIT FFT.
 * Operates on interleaved [re, im, re, im, ...] arrays.
 */
export function fft(re: Float32Array, im: Float32Array): void {
  const N = re.length;
  if (N <= 1) return;

  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < N - 1; i++) {
    if (i < j) {
      let tmp = re[i]; re[i] = re[j]; re[j] = tmp;
      tmp = im[i]; im[i] = im[j]; im[j] = tmp;
    }
    let m = N >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }

  // Butterfly stages
  for (let size = 2; size <= N; size *= 2) {
    const halfSize = size / 2;
    const angle = (-2 * Math.PI) / size;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);

    for (let i = 0; i < N; i += size) {
      let curRe = 1;
      let curIm = 0;

      for (let k = 0; k < halfSize; k++) {
        const evenIdx = i + k;
        const oddIdx = i + k + halfSize;

        const tRe = curRe * re[oddIdx] - curIm * im[oddIdx];
        const tIm = curRe * im[oddIdx] + curIm * re[oddIdx];

        re[oddIdx] = re[evenIdx] - tRe;
        im[oddIdx] = im[evenIdx] - tIm;
        re[evenIdx] += tRe;
        im[evenIdx] += tIm;

        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

export interface FFTResult {
  magnitudeDb: Float32Array;
  phase: Float32Array;
  real: Float32Array;
  imaginary: Float32Array;
}

export function computeFFT(signal: Float32Array): FFTResult {
  const N = signal.length;
  const real = new Float32Array(N);
  const imaginary = new Float32Array(N);

  real.set(signal);

  fft(real, imaginary);

  const halfN = N / 2;
  const magnitudeDb = new Float32Array(halfN);
  const phase = new Float32Array(halfN);

  for (let i = 0; i < halfN; i++) {
    const mag = Math.sqrt(real[i] * real[i] + imaginary[i] * imaginary[i]) / N;
    magnitudeDb[i] = mag > 1e-10 ? 20 * Math.log10(mag) : -200;
    phase[i] = Math.atan2(imaginary[i], real[i]);
  }

  return { magnitudeDb, phase, real, imaginary };
}

/**
 * Pad or truncate signal to the nearest power of 2.
 */
export function padToPowerOf2(signal: Float32Array): Float32Array {
  const N = signal.length;
  if ((N & (N - 1)) === 0) return signal;

  let newLen = 1;
  while (newLen < N) newLen *= 2;

  const padded = new Float32Array(newLen);
  padded.set(signal);
  return padded;
}
