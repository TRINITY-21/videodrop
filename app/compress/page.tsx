import { toolMeta } from "@/lib/seo";
import CompressClient from "./client";

export const metadata = toolMeta(
  "/compress",
  "Compress Video Online — Free, No Upload",
  "Compress video files in your browser. No upload required — 100% local, fast, and free. Reduce MP4, MOV, AVI, WebM file sizes instantly.",
  ["compress video", "reduce video size", "video compressor", "shrink video file", "mp4 compressor"]
);

export default function CompressPage() {
  return <CompressClient />;
}
