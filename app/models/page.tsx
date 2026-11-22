import { Suspense } from "react";
import ModelsExplorer from "@/components/ModelsExplorer";

export const metadata = { title: "Models | OneAtlas" };

export default function ModelsPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-slate-500">Loading...</p>}>
      <ModelsExplorer />
    </Suspense>
  );
}