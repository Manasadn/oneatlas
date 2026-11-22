import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OneAtlas | AI Model Discovery & Intelligence",
  description: "Discover, compare and evaluate AI models across providers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white" />}>
          <Navbar />
        </Suspense>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          OneAtlas. Model data is sample data for demonstration.
        </footer>
      </body>
    </html>
  );
}