import { toolMeta } from "@/lib/seo";
import TrimClient from "./client";

export const metadata = toolMeta(
  "/trim",
  "Trim Video Online — Cut & Clip for Free",
  "Trim and cut videos with frame-accurate precision. Set start and end times — all in your browser. No upload needed.",
  ["trim video", "cut video", "video trimmer", "clip video online", "video cutter"]
);

export default function TrimPage() {
  return <TrimClient />;
}
