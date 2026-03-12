"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function Home() {

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-300 to-blue-500 text-white px-6">
      <div className="max-w-2xl text-center flex flex-col items-center gap-6">

        <h1 className="text-5xl font-extrabold">
          Dev<span className="text-blue-500">Flow</span>
        </h1>

        <p className="text-gray-900 text-lg font-bold">
          Organize seus projetos, tarefas e fluxo de desenvolvimento em um único lugar.
          Um painel simples e eficiente para desenvolvedores gerenciarem suas atividades.
        </p>

        <button
          onClick={handleLogin}
          className="cursor-pointer flex items-center gap-3 bg-white text-black font-semibold px-6 py-3 rounded-lg hover:scale-105 transition"
        >
          <FcGoogle size={24} />
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>

        <p className="text-sm text-gray-700 mt-6">
          Gerencie boards, tarefas e fluxo de desenvolvimento.
        </p>

      </div>
    </main>
  );
}