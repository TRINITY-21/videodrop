"use client";

import dynamic from "next/dynamic";

const ResizeTool = dynamic(() => import("@/components/tools/ResizeTool"), {
  ssr: false,
});

export default function ResizeClient() {
  return <ResizeTool />;
}
