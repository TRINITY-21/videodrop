import { toolMeta } from "@/lib/seo";
import MergeClient from "./client";

export const metadata = toolMeta(
  "/merge",
  "Merge Videos Online — Free, No Upload",
  "Concatenate multiple video clips into one seamless file. No upload required — 100% local, fast, and free.",
  ["merge videos", "combine videos", "join video clips", "video merger", "concatenate videos"]
);

export default function MergePage() {
  return <MergeClient />;
}
