import { ReactNode } from "react";
import { Header } from "./_components/header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 to-blue-500 text-white">

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>

    </div>
  );
}