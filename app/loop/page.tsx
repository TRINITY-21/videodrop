import { toolMeta } from "@/lib/seo";
import LoopClient from "./client";

export const metadata = toolMeta(
  "/loop",
  "Loop Video Online — Repeat & Loop Clips",
  "Loop any video 2x, 3x, 4x or more into one seamless file. Free, private, runs in your browser.",
  ["loop video", "repeat video", "video looper", "loop mp4", "endless video loop"]
);

export default function LoopPage() {
  return <LoopClient />;
}
