import { toolMeta } from "@/lib/seo";
import ToolsClient from "./client";

export const metadata = toolMeta(
  "/tools",
  "All Video Tools — Free & Private",
  "Browse all 34 VideoDrop video tools. Compress, convert, trim, resize, create GIFs, extract audio, and more — all free, all running locally in your browser.",
  ["video tools", "all video tools", "video editing tools", "free video editor", "online video toolkit"]
);

export default function ToolsPage() {
  return <ToolsClient />;
}
