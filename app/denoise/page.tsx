import { toolMeta } from "@/lib/seo";
import DenoiseClient from "./client";

export const metadata = toolMeta(
  "/denoise",
  "Denoise Video Online",
  "Remove visual noise and grain from your footage. Free, private, runs in your browser.",
  ["denoise video", "remove video noise", "video noise reduction", "reduce grain video", "clean up video"]
);

export default function DenoisePage() {
  return <DenoiseClient />;
}
