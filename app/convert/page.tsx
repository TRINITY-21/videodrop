import { toolMeta } from "@/lib/seo";
import ConvertClient from "./client";

export const metadata = toolMeta(
  "/convert",
  "Convert Video Format — MP4, WebM, MOV, AVI",
  "Convert between MP4, WebM, MOV, AVI, and MKV — all in your browser. No upload, no server. Free and instant.",
  ["convert video", "video converter", "mp4 to webm", "convert mov to mp4", "video format converter"]
);

export default function ConvertPage() {
  return <ConvertClient />;
}
