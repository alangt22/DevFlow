"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { mutate } from "swr";
import { FiPlus } from "react-icons/fi";

interface List {
  id: string
  title: string
  order: number
}

export function CreateList({ boardId }: { boardId: string }) {
  const [listTitle, setListTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function createList() {
    if (!listTitle.trim()) return;

    setLoading(true);

    try {
      await axios.post<List>("/api/lists", { title: listTitle, boardId: boardId });

      mutate(`/api/lists?boardId=${boardId}`);

      toast.success("Lista criada com sucesso!", {
        position: "top-right",
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#29e251",
          color: "#ffffff",
          fontWeight: "bold",
        },
      });

      setListTitle("");
      setIsOpen(false);
    } catch {
      toast.error("Erro ao criar lista");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="min-w-[272px] max-w-[272px] cursor-pointer bg-blue-400 hover:bg-blue-500 text-white rounded-lg p-2 flex items-center gap-2 transition"
      >
        <FiPlus /> Adicionar uma lista
      </button>
    );
  }

  return (
    <div className="min-w-[272px] max-w-[272px] bg-blue-400/50 rounded-lg p-2">
      <input
        onKeyDown={(e) => {
          if(e.key === "Enter"){
            createList()
          }
        }}
        value={listTitle}
        onChange={(e) => setListTitle(e.target.value)}
        placeholder="Título da lista"
        className="border p-2 rounded text-sm w-full mb-2 focus:outline-none"
        autoFocus
      />
      <div className="flex gap-2 items-center justify-between">
        <button
          onClick={createList}
          disabled={loading || !listTitle.trim()}
          className="bg-blue-500 cursor-pointer text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "..." : "Adicionar lista"}
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-red-500 mr-4 text-3xl font-bold cursor-pointer transition"
        >
          x
        </button>
      </div>
    </div>
  );
}
