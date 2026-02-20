import { toolMeta } from "@/lib/seo";
import AspectRatioClient from "./client";

export const metadata = toolMeta(
  "/aspect-ratio",
  "Change Video Aspect Ratio Online",
  "Change your video's aspect ratio with letterboxing. Support for 16:9, 9:16, 4:3, 1:1, and 21:9. Free, private, runs in your browser.",
  ["change aspect ratio", "video letterbox", "16:9 video", "9:16 vertical video", "aspect ratio converter"]
);

export default function AspectRatioPage() {
  return <AspectRatioClient />;
}
