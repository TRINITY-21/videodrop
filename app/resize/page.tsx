import { toolMeta } from "@/lib/seo";
import ResizeClient from "./client";

export const metadata = toolMeta(
  "/resize",
  "Resize Video Online — Free Resolution Changer",
  "Scale your video to 1080p, 720p, 480p, or any resolution. All in your browser — no upload, no server.",
  ["resize video", "change video resolution", "scale video", "video resizer", "downscale video"]
);

export default function ResizePage() {
  return <ResizeClient />;
}
