"use client";

import dynamic from "next/dynamic";

const WatermarkTool = dynamic(() => import("@/components/tools/WatermarkTool"), {
  ssr: false,
});

export default function WatermarkClient() {
  return <WatermarkTool />;
}
