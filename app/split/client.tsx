"use client";

import dynamic from "next/dynamic";

const SplitTool = dynamic(() => import("@/components/tools/SplitTool"), {
  ssr: false,
});

export default function SplitClient() {
  return <SplitTool />;
}
