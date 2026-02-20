"use client";

import dynamic from "next/dynamic";

const FadeTool = dynamic(() => import("@/components/tools/FadeTool"), {
  ssr: false,
});

export default function FadeClient() {
  return <FadeTool />;
}
