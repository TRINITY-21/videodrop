import { toolMeta } from "@/lib/seo";
import FlipClient from "./client";

export const metadata = toolMeta(
  "/flip",
  "Flip & Mirror Video Online",
  "Mirror your video horizontally, vertically, or both. Free, private, runs in your browser.",
  ["flip video", "mirror video", "horizontal flip", "vertical flip", "video mirror effect"]
);

export default function FlipPage() {
  return <FlipClient />;
}
