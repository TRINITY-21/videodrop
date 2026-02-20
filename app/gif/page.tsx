import { toolMeta } from "@/lib/seo";
import GifClient from "./client";

export const metadata = toolMeta(
  "/gif",
  "Video to GIF Online — Free GIF Maker",
  "Convert any video clip into a high-quality GIF. Control FPS, size, and duration. All in your browser — no upload, no server.",
  ["video to gif", "gif maker", "create gif from video", "animated gif converter", "mp4 to gif"]
);

export default function GifPage() {
  return <GifClient />;
}
