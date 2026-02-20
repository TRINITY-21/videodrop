"use client";

import dynamic from "next/dynamic";

const CompressTool = dynamic(
  () => import("@/components/tools/CompressTool"),
  { ssr: false }
);

export default function CompressClient() {
  return <CompressTool />;
}
