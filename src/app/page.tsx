"use client";
import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>

      <button
       onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
       className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        login com google
      </button>

    </div>
  );
}
