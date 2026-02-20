import { toolMeta } from "@/lib/seo";
import ExtractAudioClient from "./client";

export const metadata = toolMeta(
  "/extract-audio",
  "Extract Audio from Video — Free MP3",
  "Pull the audio track from any video as a high-quality MP3. All in your browser — no upload, no server.",
  ["extract audio from video", "video to mp3", "rip audio", "audio extractor", "get audio from video"]
);

export default function ExtractAudioPage() {
  return <ExtractAudioClient />;
}
