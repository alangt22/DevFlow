"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { mutate } from "swr";

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

    try {
      await axios.post<Board>("/api/boards", { title });

      mutate("/api/boards");

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
    } catch {
      toast.error("Erro ao criar board");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-3 text-gray-600">Crie Seus Quadros</h1>

      <div className="flex items-center gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === "Enter"){
              createBoard();
            }
          }}
          placeholder="Nome do quadro"
          className="border border-gray-700 text-gray-400 shadow-2xl p-2 rounded w-80 h-10 focus:outline-none"
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
