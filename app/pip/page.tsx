import { toolMeta } from "@/lib/seo";
import PiPClient from "./client";

export const metadata = toolMeta(
  "/pip",
  "Picture-in-Picture Video Online",
  "Overlay a small video on top of another with picture-in-picture. Free, private, runs in your browser.",
  ["picture in picture video", "pip video", "video overlay", "overlay video on video", "video inset"]
);

export default function PiPPage() {
  return <PiPClient />;
}
