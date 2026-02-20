"use client";

import dynamic from "next/dynamic";

const VolumeTool = dynamic(() => import("@/components/tools/VolumeTool"), {
  ssr: false,
});

export default function VolumeClient() {
  return <VolumeTool />;
}
