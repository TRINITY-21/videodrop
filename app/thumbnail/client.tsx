"use client";

import dynamic from "next/dynamic";

const ThumbnailTool = dynamic(() => import("@/components/tools/ThumbnailTool"), {
  ssr: false,
});

export default function ThumbnailClient() {
  return <ThumbnailTool />;
}
