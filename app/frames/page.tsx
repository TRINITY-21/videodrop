import { toolMeta } from "@/lib/seo";
import FramesClient from "./client";

export const metadata = toolMeta(
  "/frames",
  "Extract Frames from Video — Free, No Upload",
  "Extract still frames from any video as high-quality PNG images. No upload required — 100% local, fast, and free.",
  ["extract frames from video", "video to image", "capture video frame", "video screenshot", "frame grabber"]
);

export default function FramesPage() {
  return <FramesClient />;
}
