"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { FiLayout, FiLogOut } from "react-icons/fi";

export function Header() {
  return (
    <header className="w-full sticky top-0  bg-blue-400/50 backdrop-blur-sm border-b border-blue-300/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <FiLayout size={24} />
          <Link
            href="/dashboard"
            className="text-xl font-bold text-gray-100 hover:scale-105 transition"
          >
            Dev<span className="text-blue-500">Flow</span>
          </Link>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-gray-300 hover:text-red-500 flex items-center gap-1 font-semibold transition"
        >
          <FiLogOut size={24} className="inline-block mr-2" />
           sair
        </button>
      </div>
    </header>
  );
}
