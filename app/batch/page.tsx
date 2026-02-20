import { toolMeta } from "@/lib/seo";
import BatchClient from "./client";

export const metadata = toolMeta(
  "/batch",
  "Batch Process Videos — Free, No Upload",
  "Process multiple videos at once — compress, convert, or remove audio in batch. No upload required — 100% local, fast, and free.",
  ["batch video processing", "bulk video compressor", "process multiple videos", "batch convert videos", "bulk video editor"]
);

export default function BatchPage() {
  return <BatchClient />;
}
