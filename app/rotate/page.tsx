import { toolMeta } from "@/lib/seo";
import RotateClient from "./client";

export const metadata = toolMeta(
  "/rotate",
  "Rotate & Flip Video Online — Free",
  "Rotate 90°, 180°, 270° or flip your video horizontally and vertically. All in your browser — no upload, no server.",
  ["rotate video", "flip video", "video rotation", "rotate mp4", "turn video sideways"]
);

export default function RotatePage() {
  return <RotateClient />;
}
