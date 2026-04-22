import type { Metadata } from "next";
import { PuzzleBuilder } from "@/components/admin/PuzzleBuilder";

export const metadata: Metadata = {
  title: "סטודיו החידות",
  description: "כלי הבנייה לעורכי החידות — פירוק עץ, בדיקות ותצוגה מקדימה.",
  robots: { index: false, follow: false },
};

export default function AdminPage({
  searchParams,
}: {
  searchParams?: { date?: string | string[] };
}) {
  const raw = searchParams?.date;
  const requested = Array.isArray(raw) ? raw[0] : raw;
  const initialDate = /^\d{4}-\d{2}-\d{2}$/.test(requested ?? "") ? requested : undefined;
  return <PuzzleBuilder initialDate={initialDate} />;
}
