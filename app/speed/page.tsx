import { toolMeta } from "@/lib/seo";
import SpeedClient from "./client";

export const metadata = toolMeta(
  "/speed",
  "Change Video Speed — Slow Mo & Fast Forward",
  "Speed up or slow down any video. Create slow-motion, timelapse, or fast-forward effects. All in your browser.",
  ["change video speed", "slow motion video", "speed up video", "fast forward video", "video speed changer"]
);

export default function SpeedPage() {
  return <SpeedClient />;
}
