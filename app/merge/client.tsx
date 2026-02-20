"use client";

import dynamic from "next/dynamic";

const MergeTool = dynamic(
  () => import("@/components/tools/MergeTool"),
  { ssr: false }
);

export default function MergeClient() {
  return <MergeTool />;
}
