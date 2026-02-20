import { toolMeta } from "@/lib/seo";
import TimelapseClient from "./client";

export const metadata = toolMeta(
  "/timelapse",
  "Create Timelapse from Images Online",
  "Turn a series of images into a smooth timelapse video. Free, private, runs in your browser.",
  ["timelapse from images", "create timelapse", "images to video", "photo timelapse", "timelapse maker"]
);

export default function TimelapsePage() {
  return <TimelapseClient />;
}
