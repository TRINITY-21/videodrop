"use client";

import dynamic from "next/dynamic";

const DenoiseTool = dynamic(() => import("@/components/tools/DenoiseTool"), {
  ssr: false,
});

export default function DenoiseClient() {
  return <DenoiseTool />;
}
