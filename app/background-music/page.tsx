import { toolMeta } from "@/lib/seo";
import BackgroundMusicClient from "./client";

export const metadata = toolMeta(
  "/background-music",
  "Add Background Music to Video Online",
  "Mix background music into your video while keeping the original audio. Free, private, runs in your browser.",
  ["add background music to video", "music overlay video", "mix audio video", "video background music", "add song to video"]
);

export default function BackgroundMusicPage() {
  return <BackgroundMusicClient />;
}
