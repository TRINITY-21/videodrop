import { toolMeta } from "@/lib/seo";
import VolumeClient from "./client";

export const metadata = toolMeta(
  "/volume",
  "Adjust Video Volume — Boost or Reduce",
  "Boost or reduce your video's audio volume. Free, private, runs in your browser.",
  ["adjust video volume", "boost audio volume", "reduce video volume", "increase volume video", "video volume changer"]
);

export default function VolumePage() {
  return <VolumeClient />;
}
