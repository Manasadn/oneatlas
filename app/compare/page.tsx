import { Suspense } from "react";
import CompareView from "@/components/CompareView";

export const metadata = { title: "Compare models | OneAtlas" };

export default function ComparePage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-slate-500">Loading...</p>}>
      <CompareView />
    </Suspense>
  );
}