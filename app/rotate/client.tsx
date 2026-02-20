"use client";

import dynamic from "next/dynamic";

const RotateTool = dynamic(() => import("@/components/tools/RotateTool"), {
  ssr: false,
});

export default function RotateClient() {
  return <RotateTool />;
}
