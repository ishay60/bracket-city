import { Suspense } from "react";
import { GameContainer } from "@/components/GameContainer";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <GameContainer />
    </Suspense>
  );
}
