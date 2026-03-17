import { ReactNode } from "react";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-200">

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>

      <Footer />

    </div>
  );
}