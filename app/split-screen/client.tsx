"use client";

import dynamic from "next/dynamic";

const SplitScreenTool = dynamic(() => import("@/components/tools/SplitScreenTool"), {
  ssr: false,
});

export default function SplitScreenClient() {
  return <SplitScreenTool />;
}
