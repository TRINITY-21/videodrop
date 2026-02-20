"use client";

import dynamic from "next/dynamic";

const BackgroundMusicTool = dynamic(() => import("@/components/tools/BackgroundMusicTool"), {
  ssr: false,
});

export default function BackgroundMusicClient() {
  return <BackgroundMusicTool />;
}
