"use client";

import dynamic from "next/dynamic";

const PiPTool = dynamic(() => import("@/components/tools/PiPTool"), {
  ssr: false,
});

export default function PiPClient() {
  return <PiPTool />;
}
