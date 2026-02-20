"use client";

import dynamic from "next/dynamic";

const FrameExtractTool = dynamic(
  () => import("@/components/tools/FrameExtractTool"),
  { ssr: false }
);

export default function FramesClient() {
  return <FrameExtractTool />;
}
