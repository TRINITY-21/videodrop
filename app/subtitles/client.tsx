"use client";

import dynamic from "next/dynamic";

const SubtitleTool = dynamic(() => import("@/components/tools/SubtitleTool"), {
  ssr: false,
});

export default function SubtitlesClient() {
  return <SubtitleTool />;
}
