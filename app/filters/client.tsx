"use client";

import dynamic from "next/dynamic";

const FiltersTool = dynamic(
  () => import("@/components/tools/FiltersTool"),
  { ssr: false }
);

export default function FiltersClient() {
  return <FiltersTool />;
}
