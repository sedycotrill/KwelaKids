import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
}



export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header learnerName="Learner" />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
