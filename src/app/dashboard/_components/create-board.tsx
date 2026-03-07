"use client";
import { useState } from "react";
import { toast } from "sonner";

interface Board {
  id: string;
  title: string;
}

export function CreateBoard() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function createBoard() {
    if (!title.trim()) return;

    setLoading(true);

    const res = await fetch("/api/boards", {
      method: "POST",
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      toast.error("Erro ao criar board");
      setLoading(false);
      return;
    }

    const newBoard: Board = await res.json();

    window.dispatchEvent(new CustomEvent("board-created", { detail: newBoard }));

    toast.success("Board criado com sucesso!", {
      position: "top-right",
      duration: 2000,
      style: {
        borderRadius: "10px",
        background: "#29e251",
        color: "#ffffff",
        fontWeight: "bold",
      },
    });


    setTitle("");
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Crie Seus Boards</h1>

      <div className="flex items-center gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome do board"
          className="border p-2 rounded w-full h-10 focus:outline-none"
        />

        <button
          onClick={createBoard}
          className={`bg-blue-500 cursor-pointer text-white px-4 h-10 rounded hover:bg-blue-600 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar"}
        </button>
      </div>
    </div>
  );
}
