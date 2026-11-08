import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-linear-to-b from-sky-50 via-white to-amber-50">
      {/* Decorative floating shapes (purely visual) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-16 top-40 h-56 w-56 rounded-full bg-sky-200/40 blur-2xl" />
        <div className="absolute -right-20 top-72 h-64 w-64 rounded-full bg-purple-200/40 blur-2xl" />
        <div className="absolute bottom-40 left-1/3 h-48 w-48 rounded-full bg-amber-200/50 blur-2xl" />
      </div>

      <Header />

      <main className="relative z-10 flex-1">{children}</main>

      <Footer />
    </div>
  );
}