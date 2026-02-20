"use client";

import dynamic from "next/dynamic";

const ReverseTool = dynamic(() => import("@/components/tools/ReverseTool"), {
  ssr: false,
});

export default function ReverseClient() {
  return <ReverseTool />;
}
