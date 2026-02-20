import { toolMeta } from "@/lib/seo";
import ReplaceAudioClient from "./client";

export const metadata = toolMeta(
  "/replace-audio",
  "Replace Video Audio Track Online",
  "Swap your video's audio with a different audio file. Free, private, runs in your browser.",
  ["replace audio in video", "swap video audio", "change audio track", "add new audio to video", "audio replacement"]
);

export default function ReplaceAudioPage() {
  return <ReplaceAudioClient />;
}
