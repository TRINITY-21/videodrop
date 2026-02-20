"use client";

import dynamic from "next/dynamic";

const ExtractAudioTool = dynamic(
  () => import("@/components/tools/ExtractAudioTool"),
  { ssr: false }
);

export default function ExtractAudioClient() {
  return <ExtractAudioTool />;
}
