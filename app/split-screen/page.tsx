import { toolMeta } from "@/lib/seo";
import SplitScreenClient from "./client";

export const metadata = toolMeta(
  "/split-screen",
  "Split Screen Video Online",
  "Place two videos side by side or stacked. Free, private, runs in your browser.",
  ["split screen video", "side by side video", "video comparison", "dual video", "two videos together"]
);

export default function SplitScreenPage() {
  return <SplitScreenClient />;
}
