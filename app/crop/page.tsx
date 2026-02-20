import { toolMeta } from "@/lib/seo";
import CropClient from "./client";

export const metadata = toolMeta(
  "/crop",
  "Crop Video Online — Free, No Upload",
  "Crop your video to any aspect ratio in your browser. No upload required — 100% local, fast, and free.",
  ["crop video", "video cropper", "cut video edges", "resize crop video", "trim video frame"]
);

export default function CropPage() {
  return <CropClient />;
}
