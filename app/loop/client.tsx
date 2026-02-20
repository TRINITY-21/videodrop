"use client";

import dynamic from "next/dynamic";

const LoopTool = dynamic(() => import("@/components/tools/LoopTool"), {
  ssr: false,
});

export default function LoopClient() {
  return <LoopTool />;
}
