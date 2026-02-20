import { toolMeta } from "@/lib/seo";
import ChromaKeyClient from "./client";

export const metadata = toolMeta(
  "/chroma-key",
  "Chroma Key — Green Screen Removal Online",
  "Remove green screen or any solid color background from video. Free, private, runs in your browser.",
  ["chroma key", "green screen removal", "remove background video", "color key video", "green screen online"]
);

export default function ChromaKeyPage() {
  return <ChromaKeyClient />;
}
