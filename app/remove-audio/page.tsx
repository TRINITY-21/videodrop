import { toolMeta } from "@/lib/seo";
import RemoveAudioClient from "./client";

export const metadata = toolMeta(
  "/remove-audio",
  "Remove Audio from Video — Free",
  "Strip audio from any video instantly. No re-encoding — lightning fast. 100% local, no upload needed.",
  ["remove audio from video", "mute video", "strip audio", "silent video", "delete audio track"]
);

export default function RemoveAudioPage() {
  return <RemoveAudioClient />;
}
