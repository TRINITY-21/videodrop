import { toolMeta } from "@/lib/seo";
import WebPClient from "./client";

export const metadata = toolMeta(
  "/webp",
  "Convert Video to Animated WebP Online",
  "Turn your video into an animated WebP image. Free, private, runs in your browser.",
  ["video to webp", "animated webp", "convert video to webp", "webp animation", "video to animated image"]
);

export default function WebPPage() {
  return <WebPClient />;
}
