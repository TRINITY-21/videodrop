"use client";

import dynamic from "next/dynamic";

const RemoveAudioTool = dynamic(
  () => import("@/components/tools/RemoveAudioTool"),
  { ssr: false }
);

export default function RemoveAudioClient() {
  return <RemoveAudioTool />;
}
