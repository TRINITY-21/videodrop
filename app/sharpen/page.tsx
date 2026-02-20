import { toolMeta } from "@/lib/seo";
import SharpenClient from "./client";

export const metadata = toolMeta(
  "/sharpen",
  "Sharpen Video Online",
  "Enhance clarity and sharpness of your video. Free, private, runs in your browser.",
  ["sharpen video", "video sharpening", "enhance video clarity", "unsharp mask video", "improve video quality"]
);

export default function SharpenPage() {
  return <SharpenClient />;
}
