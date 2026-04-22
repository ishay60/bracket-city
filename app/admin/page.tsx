import type { Metadata } from "next";
import { PuzzleBuilder } from "@/components/admin/PuzzleBuilder";

export const metadata: Metadata = {
  title: "סטודיו החידות",
  description: "כלי הבנייה לעורכי החידות — פירוק עץ, בדיקות ותצוגה מקדימה.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <PuzzleBuilder />;
}
