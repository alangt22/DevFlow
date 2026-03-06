"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="bg-red-500 cursor-pointer hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
    >
      Sair
    </button>
  );
}
