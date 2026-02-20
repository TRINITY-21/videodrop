import { toolMeta } from "@/lib/seo";
import FadeClient from "./client";

export const metadata = toolMeta(
  "/fade",
  "Add Fade In / Out to Video Online",
  "Add smooth fade-to-black transitions at the start and end of your video. Free, private, runs in your browser.",
  ["fade in video", "fade out video", "video fade effect", "fade to black", "video transitions"]
);

export default function FadePage() {
  return <FadeClient />;
}
