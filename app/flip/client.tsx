"use client";

import dynamic from "next/dynamic";

const FlipTool = dynamic(() => import("@/components/tools/FlipTool"), {
  ssr: false,
});

export default function FlipClient() {
  return <FlipTool />;
}
