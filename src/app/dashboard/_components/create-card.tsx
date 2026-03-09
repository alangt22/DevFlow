"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { mutate } from "swr";
import { FiPlus } from "react-icons/fi";

interface Card {
  id: string;
  title: string;
  description?: string;
}

export function CreateCard({ listId }: { listId: string }) {
  const [cardTitle, setCardTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function createCard() {
    if (!cardTitle.trim()) return;

    setLoading(true);

    try {
      await axios.post<Card>("/api/cards", {
        title: cardTitle,
        listId: listId,
      });

      mutate(`/api/cards?listId=${listId}`);

      toast.success("Card criado com sucesso!", {
        position: "top-right",
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#29e251",
          color: "#ffffff",
          fontWeight: "bold",
        },
      });

      setCardTitle("");
      setIsOpen(false);
    } catch {
      toast.error("Erro ao criar card");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center mt-2 gap-2 cursor-pointer text-gray-400 hover:text-white hover:bg-blue-300 p-2 rounded w-full transition text-sm"
      >
        <FiPlus /> Adicionar card
      </button>
    );
  }

  return (
    <div className="min-w-[256px] max-w-[232px] bg-[#b7c7e6] rounded-lg p-2">
      <input
        value={cardTitle}
        onChange={(e) => setCardTitle(e.target.value)}
        placeholder="Título do card"
        className="border p-2 rounded text-sm w-full focus:outline-none mb-2"
        autoFocus
      />
      <div className="flex gap-2 justify-between">
        <button
          onClick={createCard}
          disabled={loading || !cardTitle.trim()}
          className="bg-blue-600 cursor-pointer text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : "Adicionar"}
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white px-2 py-1.5 cursor-pointer rounded text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
