"use client";

import dynamic from "next/dynamic";

const CropTool = dynamic(
  () => import("@/components/tools/CropTool"),
  { ssr: false }
);

export default function CropClient() {
  return <CropTool />;
}
