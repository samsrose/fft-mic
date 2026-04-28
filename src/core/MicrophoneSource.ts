import { type DeviceInfo, type SampleRate } from "@/types/audio";

export type PermissionState = "prompt" | "granted" | "denied" | "unavailable";

export async function checkMicrophonePermission(): Promise<PermissionState> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    return "unavailable";
  }
  try {
    const status = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    return status.state as PermissionState;
  } catch {
    return "prompt";
  }
}

export async function requestMicrophoneStream(
  deviceId?: string,
  sampleRate?: SampleRate
): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("getUserMedia is not supported in this browser");
  }

  const constraints: MediaStreamConstraints = {
    audio: {
      ...(deviceId && { deviceId: { exact: deviceId } }),
      ...(sampleRate && { sampleRate: { ideal: sampleRate } }),
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
    video: false,
  };

  return navigator.mediaDevices.getUserMedia(constraints);
}

export async function requestSystemAudioStream(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error(
      "getDisplayMedia is not supported in this browser. " +
      "System audio capture requires Chrome, Edge, or another Chromium-based browser."
    );
  }

  // getDisplayMedia requires video; we request it but discard the video track.
  // preferCurrentTab + systemAudio hints maximize the chance of capturing
  // system-wide audio rather than just a single tab.
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      // @ts-expect-error -- systemAudio is a newer constraint not yet in all TS lib types
      systemAudio: "include",
    },
    preferCurrentTab: false,
  });

  // Drop the video track -- we only need audio
  for (const track of stream.getVideoTracks()) {
    track.stop();
    stream.removeTrack(track);
  }

  if (stream.getAudioTracks().length === 0) {
    throw new Error(
      "No audio track was captured. Make sure to check \"Share audio\" or " +
      "\"Share system audio\" in the browser picker dialog."
    );
  }

  return stream;
}

export function isSystemAudioSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getDisplayMedia === "function"
  );
}

export async function enumerateAudioDevices(): Promise<DeviceInfo[]> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((d) => d.kind === "audioinput")
    .map((d) => ({
      deviceId: d.deviceId,
      label: d.label || `Microphone ${d.deviceId.slice(0, 6)}`,
      groupId: d.groupId,
    }));
}

export function stopStream(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}
