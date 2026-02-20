"use client";

import dynamic from "next/dynamic";

const GifTool = dynamic(() => import("@/components/tools/GifTool"), {
  ssr: false,
});

export default function GifClient() {
  return <GifTool />;
}
