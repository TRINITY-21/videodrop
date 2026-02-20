"use client";

import dynamic from "next/dynamic";

const TrimTool = dynamic(
  () => import("@/components/tools/TrimTool"),
  { ssr: false }
);

export default function TrimClient() {
  return <TrimTool />;
}
