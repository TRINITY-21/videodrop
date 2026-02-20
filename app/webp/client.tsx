"use client";

import dynamic from "next/dynamic";

const WebPTool = dynamic(() => import("@/components/tools/WebPTool"), {
  ssr: false,
});

export default function WebPClient() {
  return <WebPTool />;
}
