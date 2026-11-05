import type { Metadata } from "next";
import PerfumersClient from "./PerfumersClient";
import { readEvidencedPerfumerProfiles } from "@/lib/database/perfumerProfiles";

export const metadata: Metadata = {
  title: "Perfumer Profiles",
  description: "Explore 15 featured perfumers, their creative approaches and credited catalog creations.",
};

export default function PerfumersPage() {
  return <PerfumersClient profiles={readEvidencedPerfumerProfiles()} />;
}
