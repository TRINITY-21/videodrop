import { toolMeta } from "@/lib/seo";
import SubtitlesClient from "./client";

export const metadata = toolMeta(
  "/subtitles",
  "Burn Subtitles Into Video Online",
  "Hardcode SRT subtitles into your video permanently. Free, private, runs in your browser.",
  ["burn subtitles", "hardcode subtitles", "srt to video", "embed subtitles", "permanent subtitles"]
);

export default function SubtitlesPage() {
  return <SubtitlesClient />;
}
