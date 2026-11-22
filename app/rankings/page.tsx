import { Suspense } from "react";
import RankingsView from "@/components/RankingsView";

export const metadata = { title: "Rankings | OneAtlas" };

export default function RankingsPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-slate-500">Loading...</p>}>
      <RankingsView />
    </Suspense>
  );
}