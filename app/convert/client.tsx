"use client";

import dynamic from "next/dynamic";

const ConvertTool = dynamic(
  () => import("@/components/tools/ConvertTool"),
  { ssr: false }
);

export default function ConvertClient() {
  return <ConvertTool />;
}
