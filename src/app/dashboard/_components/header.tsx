"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { FiLogOut } from "react-icons/fi";

export function Header() {
  return (
    <header className="w-full sticky top-0  bg-gray-400/50 backdrop-blur-sm border-b border-gray-300/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        <Link href="/dashboard" className="text-xl font-bold text-gray-100 hover:scale-105 transition">
          Dev<span className="text-blue-500">Flow</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-gray-300 hover:text-red-500 flex items-center gap-1 font-semibold transition"
        >
          <FiLogOut size={18} className="inline-block mr-2" />
        </button>

      </div>
    </header>
  );
}