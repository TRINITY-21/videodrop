import { toolMeta } from "@/lib/seo";
import ReverseClient from "./client";

export const metadata = toolMeta(
  "/reverse",
  "Reverse Video Online — Play Backwards",
  "Reverse any video to play it backwards, audio included. Free, private, runs in your browser.",
  ["reverse video", "play video backwards", "video reverser", "backwards video", "rewind video"]
);

export default function ReversePage() {
  return <ReverseClient />;
}
