import { toolMeta } from "@/lib/seo";
import WatermarkClient from "./client";

export const metadata = toolMeta(
  "/watermark",
  "Add Text Watermark to Video Online",
  "Overlay text watermarks on your video for branding and copyright. Free, private, runs in your browser.",
  ["add watermark to video", "text watermark", "video watermark", "brand video", "copyright watermark"]
);

export default function WatermarkPage() {
  return <WatermarkClient />;
}
