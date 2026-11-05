import type { Metadata } from "next";
import { getMasterFragranceDatabase } from "@/lib/database/masterFragranceDatabase";
import { occasions } from "@/lib/data/occasions";
import OccasionsClient from "./OccasionsClient";

export const metadata: Metadata = {
  title: "When to Wear Perfume",
  description: "Explore eight fragrance occasions through olfactive territories, notes and DNA character.",
};

export default function OccasionsPage() {
  const requested = [...new Set(occasions.flatMap((item) => item.noteExamples))];
  const rows = getMasterFragranceDatabase().prepare(`
    SELECT DISTINCT lower(trim(n.value)) AS name
    FROM fragrances f, json_each(f.record_json, '$.notes') n
    WHERE n.type = 'text' AND lower(trim(n.value)) IN (${requested.map(() => "?").join(",")})
  `).all(...requested.map((note) => note.toLowerCase())) as Array<{ name: string }>;
  return <OccasionsClient availableNotes={rows.map((row) => row.name)} />;
}
