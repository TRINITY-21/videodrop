import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { FORMATS } from "./formats";
import { getExtension, getBaseName } from "./utils";

let ffmpegInstance: FFmpeg | null = null;
let loaded = false;
let loading = false;
let loadListeners: Array<() => void> = [];

export type ProgressCallback = (progress: number) => void;

export function isFFmpegLoaded(): boolean {
  return loaded;
}

export function onFFmpegLoadStart(cb: () => void): () => void {
  loadListeners.push(cb);
  return () => {
    loadListeners = loadListeners.filter((l) => l !== cb);
  };
}

const CACHE_NAME = "videodrop-ffmpeg-v1";
const BASE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

async function cachedBlobURL(url: string, mimeType: string): Promise<string> {
  if (typeof caches === "undefined") {
    // Fallback: direct fetch → blob URL (no caching)
    const resp = await fetch(url);
    const blob = await resp.blob();
    return URL.createObjectURL(new Blob([blob], { type: mimeType }));
  }

  const cache = await caches.open(CACHE_NAME);
  let resp = await cache.match(url);

  if (!resp) {
    resp = await fetch(url);
    await cache.put(url, resp.clone());
  }

  const blob = await resp.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && loaded) return ffmpegInstance;

  if (loading) {
    // Wait for existing load to complete
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (loaded && ffmpegInstance) {
          clearInterval(check);
          resolve(ffmpegInstance);
        }
      }, 100);
    });
  }

  loading = true;
  loadListeners.forEach((cb) => cb());

  ffmpegInstance = new FFmpeg();

  const [coreURL, wasmURL] = await Promise.all([
    cachedBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
    cachedBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
  ]);

  await ffmpegInstance.load({ coreURL, wasmURL });

  loaded = true;
  loading = false;
  return ffmpegInstance;
}

function setupProgress(
  ffmpeg: FFmpeg,
  onProgress?: ProgressCallback
): () => void {
  if (!onProgress) return () => {};

  const handler = ({ progress }: { progress: number }) => {
    const pct = Math.max(0, Math.min(1, progress));
    onProgress(Math.round(pct * 100));
  };

  ffmpeg.on("progress", handler);

  return () => {
    ffmpeg.off("progress", handler);
  };
}

function toBlob(data: Uint8Array | string, type: string): Blob {
  if (typeof data === "string") {
    return new Blob([data], { type });
  }
  // Copy to a standard ArrayBuffer to avoid SharedArrayBuffer issues
  const buf = new ArrayBuffer(data.byteLength);
  new Uint8Array(buf).set(data);
  return new Blob([buf], { type });
}

async function cleanup(ffmpeg: FFmpeg, files: string[]) {
  for (const f of files) {
    try {
      await ffmpeg.deleteFile(f);
    } catch {
      // file may not exist
    }
  }
}

export interface ProcessResult {
  blob: Blob;
  filename: string;
  size: number;
}

export async function compressVideo(
  file: File,
  quality: "light" | "medium" | "heavy",
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const crfMap = { light: "23", medium: "28", heavy: "35" };
  const inputName = "input" + getExtension(file.name);
  const outputName = "compressed.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-c:v", "libx264",
    "-crf", crfMap[quality],
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_compressed.mp4",
    size: blob.size,
  };
}

export async function convertVideo(
  file: File,
  outputFormat: string,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const format = FORMATS[outputFormat];
  const inputName = "input" + getExtension(file.name);
  const outputName = "output" + format.ext;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-c:v", format.vcodec,
    "-crf", "23",
    "-preset", "ultrafast",
    "-c:a", format.acodec,
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, format.mime);

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + format.ext,
    size: blob.size,
  };
}

export async function trimVideo(
  file: File,
  startTime: string,
  endTime: string,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "trimmed.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-ss", startTime,
    "-to", endTime,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_trimmed.mp4",
    size: blob.size,
  };
}

export async function removeAudio(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "silent.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-an",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_silent.mp4",
    size: blob.size,
  };
}

export async function videoToGif(
  file: File,
  startTime: string,
  duration: string,
  fps: number,
  width: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + getExtension(file.name);
  const outputName = "output.gif";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-ss", startTime,
    "-t", duration,
    "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer`,
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "image/gif");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + ".gif",
    size: blob.size,
  };
}

export async function resizeVideo(
  file: File,
  width: number,
  height: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "resized.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", `scale=${width}:${height}`,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + `_${width}x${height}.mp4`,
    size: blob.size,
  };
}

export async function changeSpeed(
  file: File,
  speed: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "speed.mp4";

  const videoFilter = `setpts=${(1 / speed).toFixed(4)}*PTS`;
  const audioFilter = `atempo=${speed}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", videoFilter,
    "-af", audioFilter,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + `_${speed}x.mp4`,
    size: blob.size,
  };
}

export async function rotateVideo(
  file: File,
  rotation: "90" | "180" | "270" | "hflip" | "vflip",
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "rotated.mp4";

  const filterMap: Record<string, string> = {
    "90": "transpose=1",
    "180": "transpose=1,transpose=1",
    "270": "transpose=2",
    "hflip": "hflip",
    "vflip": "vflip",
  };

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", filterMap[rotation],
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  const labelMap: Record<string, string> = {
    "90": "_rotated90",
    "180": "_rotated180",
    "270": "_rotated270",
    "hflip": "_flipped_h",
    "vflip": "_flipped_v",
  };

  return {
    blob,
    filename: getBaseName(file.name) + labelMap[rotation] + ".mp4",
    size: blob.size,
  };
}

export async function mergeVideos(
  files: File[],
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputNames: string[] = [];
  let concatList = "";

  for (let i = 0; i < files.length; i++) {
    const ext = getExtension(files[i].name) || ".mp4";
    const name = `input_${i}${ext}`;
    inputNames.push(name);
    await ffmpeg.writeFile(name, await fetchFile(files[i]));

    // Re-encode each clip to a common format for safe concat
    const normalized = `norm_${i}.ts`;
    await ffmpeg.exec([
      "-i", name,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-c:a", "aac",
      "-b:a", "128k",
      "-f", "mpegts",
      normalized,
    ]);
    concatList += (i > 0 ? "|" : "") + normalized;
    inputNames.push(normalized);
  }

  const outputName = "merged.mp4";

  await ffmpeg.exec([
    "-i", `concat:${concatList}`,
    "-c", "copy",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [...inputNames, outputName]);
  removeProgress();

  return {
    blob,
    filename: "merged.mp4",
    size: blob.size,
  };
}

export interface PresetConfig {
  maxWidth: number;
  maxHeight: number;
  crf: string;
  maxBitrate: string;
  audioBitrate: string;
}

export const PLATFORM_PRESETS: Record<string, PresetConfig> = {
  instagram: { maxWidth: 1080, maxHeight: 1920, crf: "23", maxBitrate: "3500k", audioBitrate: "128k" },
  email: { maxWidth: 854, maxHeight: 480, crf: "30", maxBitrate: "1000k", audioBitrate: "96k" },
  discord: { maxWidth: 1280, maxHeight: 720, crf: "28", maxBitrate: "2000k", audioBitrate: "128k" },
};

export async function presetCompress(
  file: File,
  presetKey: string,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const preset = PLATFORM_PRESETS[presetKey];
  const inputName = "input" + getExtension(file.name);
  const outputName = `${presetKey}.mp4`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-c:v", "libx264",
    "-crf", preset.crf,
    "-preset", "ultrafast",
    "-maxrate", preset.maxBitrate,
    "-bufsize", `${parseInt(preset.maxBitrate) * 2}k`,
    "-vf", `scale='min(${preset.maxWidth},iw)':'min(${preset.maxHeight},ih)':force_original_aspect_ratio=decrease`,
    "-c:a", "aac",
    "-b:a", preset.audioBitrate,
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + `_${presetKey}.mp4`,
    size: blob.size,
  };
}

export async function extractAudio(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + getExtension(file.name);
  const outputName = "audio.mp3";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vn",
    "-c:a", "libmp3lame",
    "-q:a", "2",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "audio/mpeg");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + ".mp3",
    size: blob.size,
  };
}

export async function cropVideo(
  file: File,
  x: number,
  y: number,
  w: number,
  h: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "cropped.mp4";

  // Ensure even dimensions
  const cw = w % 2 === 0 ? w : w - 1;
  const ch = h % 2 === 0 ? h : h - 1;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", `crop=${cw}:${ch}:${x}:${y}`,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_cropped.mp4",
    size: blob.size,
  };
}

export async function extractFrames(
  file: File,
  timestamp: string,
  count: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult[]> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + getExtension(file.name);
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const results: ProcessResult[] = [];
  const filesToClean = [inputName];

  for (let i = 0; i < count; i++) {
    const outputName = `frame_${i}.png`;
    filesToClean.push(outputName);

    // Extract frame at offset from timestamp
    const offsetSeconds = parseFloat(timestamp) + i * 0.5;
    await ffmpeg.exec([
      "-ss", String(offsetSeconds),
      "-i", inputName,
      "-frames:v", "1",
      "-q:v", "2",
      outputName,
    ]);

    try {
      const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
      const blob = toBlob(data, "image/png");
      results.push({
        blob,
        filename: `${getBaseName(file.name)}_frame_${i + 1}.png`,
        size: blob.size,
      });
    } catch {
      // Frame might not exist if timestamp exceeds duration
    }
  }

  await cleanup(ffmpeg, filesToClean);
  removeProgress();

  return results;
}

export interface FilterSettings {
  brightness: number; // -1 to 1, default 0
  contrast: number;   // -1 to 1, default 0
  saturation: number; // 0 to 3, default 1
  grayscale: boolean;
}

export async function applyFilters(
  file: File,
  filters: FilterSettings,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "filtered.mp4";

  const filterParts: string[] = [];

  // eq filter for brightness, contrast, saturation
  const eqParts: string[] = [];
  if (filters.brightness !== 0) eqParts.push(`brightness=${filters.brightness.toFixed(2)}`);
  if (filters.contrast !== 0) eqParts.push(`contrast=${(1 + filters.contrast).toFixed(2)}`);
  if (filters.saturation !== 1) eqParts.push(`saturation=${filters.saturation.toFixed(2)}`);
  if (eqParts.length > 0) filterParts.push(`eq=${eqParts.join(":")}`);

  if (filters.grayscale) filterParts.push("hue=s=0");

  const vf = filterParts.length > 0 ? filterParts.join(",") : "null";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", vf,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_filtered.mp4",
    size: blob.size,
  };
}

export async function reverseVideo(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "reversed.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", "reverse",
    "-af", "areverse",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_reversed.mp4",
    size: blob.size,
  };
}

export async function loopVideo(
  file: File,
  loopCount: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "looped.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // First normalize to mpegts, then concat N times
  const tsName = "norm.ts";
  await ffmpeg.exec([
    "-i", inputName,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-b:a", "128k",
    "-f", "mpegts",
    tsName,
  ]);

  const concatList = Array(loopCount).fill(tsName).join("|");

  await ffmpeg.exec([
    "-i", `concat:${concatList}`,
    "-c", "copy",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, tsName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + `_${loopCount}x.mp4`,
    size: blob.size,
  };
}

export async function addWatermark(
  file: File,
  text: string,
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center",
  fontSize: number,
  color: string,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "watermarked.mp4";

  const posMap: Record<string, string> = {
    "top-left": "x=20:y=20",
    "top-right": "x=w-tw-20:y=20",
    "bottom-left": "x=20:y=h-th-20",
    "bottom-right": "x=w-tw-20:y=h-th-20",
    "center": "x=(w-tw)/2:y=(h-th)/2",
  };

  const escapedText = text.replace(/'/g, "'\\''").replace(/:/g, "\\:");
  const drawtext = `drawtext=text='${escapedText}':fontsize=${fontSize}:fontcolor=${color}:${posMap[position]}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", drawtext,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_watermarked.mp4",
    size: blob.size,
  };
}

export async function addFade(
  file: File,
  fadeInDuration: number,
  fadeOutDuration: number,
  totalDuration: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "faded.mp4";

  const vfParts: string[] = [];
  const afParts: string[] = [];

  if (fadeInDuration > 0) {
    vfParts.push(`fade=t=in:st=0:d=${fadeInDuration}`);
    afParts.push(`afade=t=in:st=0:d=${fadeInDuration}`);
  }
  if (fadeOutDuration > 0) {
    const fadeOutStart = Math.max(0, totalDuration - fadeOutDuration);
    vfParts.push(`fade=t=out:st=${fadeOutStart}:d=${fadeOutDuration}`);
    afParts.push(`afade=t=out:st=${fadeOutStart}:d=${fadeOutDuration}`);
  }

  const vf = vfParts.length > 0 ? vfParts.join(",") : "null";
  const af = afParts.length > 0 ? afParts.join(",") : "anull";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", vf,
    "-af", af,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_faded.mp4",
    size: blob.size,
  };
}

export async function replaceAudio(
  videoFile: File,
  audioFile: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const videoInput = "video_input" + (getExtension(videoFile.name) || ".mp4");
  const audioInput = "audio_input" + (getExtension(audioFile.name) || ".mp3");
  const outputName = "replaced_audio.mp4";

  await ffmpeg.writeFile(videoInput, await fetchFile(videoFile));
  await ffmpeg.writeFile(audioInput, await fetchFile(audioFile));
  await ffmpeg.exec([
    "-i", videoInput,
    "-i", audioInput,
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-shortest",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [videoInput, audioInput, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(videoFile.name) + "_new_audio.mp4",
    size: blob.size,
  };
}

export async function splitVideo(
  file: File,
  segments: number,
  totalDuration: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult[]> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const segmentDuration = totalDuration / segments;
  const results: ProcessResult[] = [];
  const filesToClean = [inputName];

  for (let i = 0; i < segments; i++) {
    const start = i * segmentDuration;
    const outputName = `segment_${i}.mp4`;
    filesToClean.push(outputName);

    await ffmpeg.exec([
      "-i", inputName,
      "-ss", String(start),
      "-t", String(segmentDuration),
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-c:a", "aac",
      "-movflags", "+faststart",
      outputName,
    ]);

    const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
    const blob = toBlob(data, "video/mp4");
    results.push({
      blob,
      filename: `${getBaseName(file.name)}_part${i + 1}.mp4`,
      size: blob.size,
    });
  }

  await cleanup(ffmpeg, filesToClean);
  removeProgress();

  return results;
}

export async function burnSubtitles(
  videoFile: File,
  subtitleFile: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const videoInput = "video_input" + (getExtension(videoFile.name) || ".mp4");
  const subInput = "subs.srt";
  const outputName = "subtitled.mp4";

  await ffmpeg.writeFile(videoInput, await fetchFile(videoFile));
  await ffmpeg.writeFile(subInput, await fetchFile(subtitleFile));

  // Use ASS filter for subtitle burn-in (SRT is auto-converted)
  await ffmpeg.exec([
    "-i", videoInput,
    "-vf", `subtitles=${subInput}`,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [videoInput, subInput, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(videoFile.name) + "_subtitled.mp4",
    size: blob.size,
  };
}

export async function boomerangVideo(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const forwardTs = "forward.ts";
  const reverseTs = "reverse.ts";
  const outputName = "boomerang.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // Create forward segment
  await ffmpeg.exec([
    "-i", inputName,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-b:a", "128k",
    "-f", "mpegts",
    forwardTs,
  ]);

  // Create reversed segment
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", "reverse",
    "-af", "areverse",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-b:a", "128k",
    "-f", "mpegts",
    reverseTs,
  ]);

  // Concat forward + reverse
  await ffmpeg.exec([
    "-i", `concat:${forwardTs}|${reverseTs}`,
    "-c", "copy",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, forwardTs, reverseTs, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_boomerang.mp4",
    size: blob.size,
  };
}

export async function flipVideo(
  file: File,
  direction: "horizontal" | "vertical" | "both",
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "flipped.mp4";

  const filterMap: Record<string, string> = {
    horizontal: "hflip",
    vertical: "vflip",
    both: "hflip,vflip",
  };

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", filterMap[direction],
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  const labelMap: Record<string, string> = {
    horizontal: "_hflip",
    vertical: "_vflip",
    both: "_flipped",
  };

  return {
    blob,
    filename: getBaseName(file.name) + labelMap[direction] + ".mp4",
    size: blob.size,
  };
}

export async function adjustVolume(
  file: File,
  volume: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "volume.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-af", `volume=${volume.toFixed(2)}`,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + `_vol${Math.round(volume * 100)}pct.mp4`,
    size: blob.size,
  };
}

export async function pictureInPicture(
  mainFile: File,
  overlayFile: File,
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right",
  scale: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const mainInput = "main_input" + (getExtension(mainFile.name) || ".mp4");
  const overlayInput = "overlay_input" + (getExtension(overlayFile.name) || ".mp4");
  const outputName = "pip.mp4";

  const posMap: Record<string, string> = {
    "top-left": "10:10",
    "top-right": "main_w-overlay_w-10:10",
    "bottom-left": "10:main_h-overlay_h-10",
    "bottom-right": "main_w-overlay_w-10:main_h-overlay_h-10",
  };

  await ffmpeg.writeFile(mainInput, await fetchFile(mainFile));
  await ffmpeg.writeFile(overlayInput, await fetchFile(overlayFile));
  await ffmpeg.exec([
    "-i", mainInput,
    "-i", overlayInput,
    "-filter_complex",
    `[1:v]scale=iw*${scale}:ih*${scale}[pip];[0:v][pip]overlay=${posMap[position]}:shortest=1`,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-shortest",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [mainInput, overlayInput, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(mainFile.name) + "_pip.mp4",
    size: blob.size,
  };
}

export async function addBackgroundMusic(
  videoFile: File,
  audioFile: File,
  musicVolume: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const videoInput = "video_input" + (getExtension(videoFile.name) || ".mp4");
  const audioInput = "audio_input" + (getExtension(audioFile.name) || ".mp3");
  const outputName = "with_music.mp4";

  await ffmpeg.writeFile(videoInput, await fetchFile(videoFile));
  await ffmpeg.writeFile(audioInput, await fetchFile(audioFile));
  await ffmpeg.exec([
    "-i", videoInput,
    "-i", audioInput,
    "-filter_complex",
    `[0:a]volume=1.0[a0];[1:a]volume=${musicVolume.toFixed(2)}[a1];[a0][a1]amix=inputs=2:duration=shortest[aout]`,
    "-map", "0:v:0",
    "-map", "[aout]",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-shortest",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [videoInput, audioInput, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(videoFile.name) + "_music.mp4",
    size: blob.size,
  };
}

export async function videoToWebP(
  file: File,
  fps: number,
  width: number,
  startTime: string,
  duration: string,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + getExtension(file.name);
  const outputName = "output.webp";

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-ss", startTime,
    "-t", duration,
    "-vf", `fps=${fps},scale=${width}:-1`,
    "-loop", "0",
    "-preset", "default",
    "-an",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "image/webp");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + ".webp",
    size: blob.size,
  };
}

export async function changeAspectRatio(
  file: File,
  targetWidth: number,
  targetHeight: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "letterboxed.mp4";

  // Scale to fit within target while maintaining aspect ratio, then pad
  const vf = `scale='min(${targetWidth},iw*${targetHeight}/ih)':'min(${targetHeight},ih*${targetWidth}/iw)':force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(${targetWidth}-iw)/2:(${targetHeight}-ih)/2:black`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", vf,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + `_${targetWidth}x${targetHeight}.mp4`,
    size: blob.size,
  };
}

export async function sharpenVideo(
  file: File,
  strength: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "sharpened.mp4";

  // unsharp: luma_msize_x:luma_msize_y:luma_amount
  const amount = strength.toFixed(1);
  const vf = `unsharp=5:5:${amount}:5:5:0.0`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", vf,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_sharpened.mp4",
    size: blob.size,
  };
}

export async function denoiseVideo(
  file: File,
  strength: "light" | "medium" | "heavy",
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "denoised.mp4";

  const strengthMap: Record<string, string> = {
    light: "hqdn3d=2:1.5:3:2.25",
    medium: "hqdn3d=4:3:6:4.5",
    heavy: "hqdn3d=8:6:12:9",
  };

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", strengthMap[strength],
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_denoised.mp4",
    size: blob.size,
  };
}

export async function chromaKey(
  file: File,
  color: string,
  similarity: number,
  blend: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + (getExtension(file.name) || ".mp4");
  const outputName = "chromakey.mp4";

  const vf = `colorkey=${color}:${similarity.toFixed(2)}:${blend.toFixed(2)}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vf", vf,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_keyed.mp4",
    size: blob.size,
  };
}

export async function generateThumbnail(
  file: File,
  mode: "auto" | "manual",
  timestamp: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputName = "input" + getExtension(file.name);
  const outputName = "thumbnail.jpg";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  if (mode === "auto") {
    // Use thumbnail filter to pick the most representative frame
    await ffmpeg.exec([
      "-i", inputName,
      "-vf", "thumbnail=300",
      "-frames:v", "1",
      "-q:v", "2",
      outputName,
    ]);
  } else {
    await ffmpeg.exec([
      "-ss", String(timestamp),
      "-i", inputName,
      "-frames:v", "1",
      "-q:v", "2",
      outputName,
    ]);
  }

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "image/jpeg");

  await cleanup(ffmpeg, [inputName, outputName]);
  removeProgress();

  return {
    blob,
    filename: getBaseName(file.name) + "_thumbnail.jpg",
    size: blob.size,
  };
}

export async function imagesToTimelapse(
  files: File[],
  fps: number,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const inputNames: string[] = [];

  // Write all images with sequential names
  for (let i = 0; i < files.length; i++) {
    const ext = getExtension(files[i].name) || ".jpg";
    const name = `img_${String(i).padStart(5, "0")}${ext}`;
    inputNames.push(name);
    await ffmpeg.writeFile(name, await fetchFile(files[i]));
  }

  // Create a concat file listing all images
  const concatContent = inputNames.map((n) => `file '${n}'\nduration ${(1 / fps).toFixed(4)}`).join("\n");
  await ffmpeg.writeFile("concat.txt", concatContent);

  const outputName = "timelapse.mp4";

  await ffmpeg.exec([
    "-f", "concat",
    "-safe", "0",
    "-i", "concat.txt",
    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [...inputNames, "concat.txt", outputName]);
  removeProgress();

  return {
    blob,
    filename: "timelapse.mp4",
    size: blob.size,
  };
}

export async function splitScreenVideo(
  leftFile: File,
  rightFile: File,
  layout: "horizontal" | "vertical",
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const ffmpeg = await getFFmpeg();
  const removeProgress = setupProgress(ffmpeg, onProgress);

  const leftInput = "left_input" + (getExtension(leftFile.name) || ".mp4");
  const rightInput = "right_input" + (getExtension(rightFile.name) || ".mp4");
  const outputName = "splitscreen.mp4";

  await ffmpeg.writeFile(leftInput, await fetchFile(leftFile));
  await ffmpeg.writeFile(rightInput, await fetchFile(rightFile));

  const filterComplex = layout === "horizontal"
    ? "[0:v]scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(640-iw)/2:(480-ih)/2[l];[1:v]scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(640-iw)/2:(480-ih)/2[r];[l][r]hstack=inputs=2[v]"
    : "[0:v]scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(640-iw)/2:(360-ih)/2[t];[1:v]scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(640-iw)/2:(360-ih)/2[b];[t][b]vstack=inputs=2[v]";

  await ffmpeg.exec([
    "-i", leftInput,
    "-i", rightInput,
    "-filter_complex", filterComplex,
    "-map", "[v]",
    "-map", "0:a?",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-shortest",
    "-movflags", "+faststart",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = toBlob(data, "video/mp4");

  await cleanup(ffmpeg, [leftInput, rightInput, outputName]);
  removeProgress();

  return {
    blob,
    filename: "splitscreen.mp4",
    size: blob.size,
  };
}
