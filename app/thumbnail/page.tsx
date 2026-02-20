import { toolMeta } from "@/lib/seo";
import ThumbnailClient from "./client";

export const metadata = toolMeta(
  "/thumbnail",
  "Generate Video Thumbnail Online",
  "Extract the perfect thumbnail from your video. Auto-detect or pick a timestamp. Free, private, runs in your browser.",
  ["video thumbnail", "thumbnail generator", "extract thumbnail from video", "video screenshot", "youtube thumbnail"]
);

export default function ThumbnailPage() {
  return <ThumbnailClient />;
}
