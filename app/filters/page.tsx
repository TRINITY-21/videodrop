import { toolMeta } from "@/lib/seo";
import FiltersClient from "./client";

export const metadata = toolMeta(
  "/filters",
  "Video Filters & Adjustments — Free, No Upload",
  "Adjust brightness, contrast, saturation, and apply grayscale to your video. No upload required — 100% local, fast, and free.",
  ["video filters", "adjust brightness video", "video contrast", "saturation video", "grayscale video"]
);

export default function FiltersPage() {
  return <FiltersClient />;
}
