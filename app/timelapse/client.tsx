"use client";

import dynamic from "next/dynamic";

const TimelapseTool = dynamic(() => import("@/components/tools/TimelapseTool"), {
  ssr: false,
});

export default function TimelapseClient() {
  return <TimelapseTool />;
}
