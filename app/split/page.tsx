import { toolMeta } from "@/lib/seo";
import SplitClient from "./client";

export const metadata = toolMeta(
  "/split",
  "Split Video Into Parts Online",
  "Divide any video into equal segments. Free, private, runs in your browser.",
  ["split video", "divide video", "video splitter", "cut video into parts", "segment video"]
);

export default function SplitPage() {
  return <SplitClient />;
}
