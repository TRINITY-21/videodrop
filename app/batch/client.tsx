"use client";

import dynamic from "next/dynamic";

const BatchTool = dynamic(
  () => import("@/components/tools/BatchTool"),
  { ssr: false }
);

export default function BatchClient() {
  return <BatchTool />;
}
