"use client";

import dynamic from "next/dynamic";

const BoomerangTool = dynamic(() => import("@/components/tools/BoomerangTool"), {
  ssr: false,
});

export default function BoomerangClient() {
  return <BoomerangTool />;
}
