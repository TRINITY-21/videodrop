"use client";

import dynamic from "next/dynamic";

const SpeedTool = dynamic(() => import("@/components/tools/SpeedTool"), {
  ssr: false,
});

export default function SpeedClient() {
  return <SpeedTool />;
}
