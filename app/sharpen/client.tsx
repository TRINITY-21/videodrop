"use client";

import dynamic from "next/dynamic";

const SharpenTool = dynamic(() => import("@/components/tools/SharpenTool"), {
  ssr: false,
});

export default function SharpenClient() {
  return <SharpenTool />;
}
