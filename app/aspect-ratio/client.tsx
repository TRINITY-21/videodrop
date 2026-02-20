"use client";

import dynamic from "next/dynamic";

const AspectRatioTool = dynamic(() => import("@/components/tools/AspectRatioTool"), {
  ssr: false,
});

export default function AspectRatioClient() {
  return <AspectRatioTool />;
}
