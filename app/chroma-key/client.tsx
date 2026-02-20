"use client";

import dynamic from "next/dynamic";

const ChromaKeyTool = dynamic(() => import("@/components/tools/ChromaKeyTool"), {
  ssr: false,
});

export default function ChromaKeyClient() {
  return <ChromaKeyTool />;
}
