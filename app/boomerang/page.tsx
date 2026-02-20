import { toolMeta } from "@/lib/seo";
import BoomerangClient from "./client";

export const metadata = toolMeta(
  "/boomerang",
  "Boomerang Video — Forward & Reverse Loop",
  "Create Instagram-style boomerang videos — plays forward then in reverse. Free, private, runs in your browser.",
  ["boomerang video", "boomerang effect", "forward reverse loop", "instagram boomerang", "bounce video"]
);

export default function BoomerangPage() {
  return <BoomerangClient />;
}
