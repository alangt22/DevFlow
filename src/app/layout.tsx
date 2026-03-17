import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionAuthProvider } from "@/providers/session-auth";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { WebViewWarning } from "./dashboard/_components/WebViewWarning";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevFlow - Sistema de gerenciamento de projetos",
  description: "DevFlow é um sistema de gerenciamento de projetos que ajuda equipes a organizar, acompanhar e colaborar em seus projetos de forma eficiente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionAuthProvider>
          <NextTopLoader color="#0e55e1" height={6} showSpinner={false} />
          <Toaster position="top-right"/>
          <WebViewWarning />
          {children}
        </SessionAuthProvider>
      </body>
    </html>
  );
}
