export interface FormatConfig {
  label: string;
  mime: string;
  ext: string;
  vcodec: string;
  acodec: string;
}

export const FORMATS: Record<string, FormatConfig> = {
  mp4: {
    label: "MP4",
    mime: "video/mp4",
    ext: ".mp4",
    vcodec: "libx264",
    acodec: "aac",
  },
  webm: {
    label: "WebM",
    mime: "video/webm",
    ext: ".webm",
    vcodec: "libvpx-vp9",
    acodec: "libopus",
  },
  mov: {
    label: "MOV",
    mime: "video/quicktime",
    ext: ".mov",
    vcodec: "libx264",
    acodec: "aac",
  },
  avi: {
    label: "AVI",
    mime: "video/x-msvideo",
    ext: ".avi",
    vcodec: "libx264",
    acodec: "aac",
  },
  mkv: {
    label: "MKV",
    mime: "video/x-matroska",
    ext: ".mkv",
    vcodec: "libx264",
    acodec: "aac",
  },
};

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
  "video/x-matroska",
  "video/avi",
  "video/x-ms-wmv",
  "video/3gpp",
];

export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
export const WARN_FILE_SIZE = 500 * 1024 * 1024; // 500MB
