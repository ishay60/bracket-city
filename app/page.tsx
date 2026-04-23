import type { Metadata } from "next";
import { Suspense } from "react";
import { GameContainer } from "@/components/GameContainer";

export const metadata: Metadata = {
  title: "חידת היום",
  description:
    "עיר הסוגריים — פענחו את המשפט החבוי, סוגר אחר סוגר, מהעלה הפנימי החוצה.",
  openGraph: {
    title: "עיר הסוגריים — חידת היום",
    description:
      "פענחו את המשפט החבוי, סוגר אחר סוגר, מהעלה הפנימי החוצה.",
  },
};

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <GameContainer />
    </Suspense>
  );
}
