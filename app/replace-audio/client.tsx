"use client";

import dynamic from "next/dynamic";

const ReplaceAudioTool = dynamic(() => import("@/components/tools/ReplaceAudioTool"), {
  ssr: false,
});

export default function ReplaceAudioClient() {
  return <ReplaceAudioTool />;
}
