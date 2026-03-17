"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import Link from "next/link";
import { FiGrid, FiTrash, FiList, FiCheckSquare } from "react-icons/fi";
import { toast } from "sonner";

interface Card {
  id: string;
  title: string;
}

interface List {
  id: string;
  title: string;
  cards: Card[];
}

interface Board {
  id: string;
  title: string;
  lists: List[];
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function BoardsList() {
  const { data: boards = [], isLoading, mutate } = useSWR<Board[]>("/api/boards", fetcher);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [loading, setLoading] = useState(false);

  const totalLists = boards.reduce((acc, board) => acc + board.lists.length, 0);
  const totalCards = boards.reduce((acc, board) => acc + board.lists.reduce((a, list) => a + list.cards.length, 0), 0);

  async function handleDelete() {
    if (!boardToDelete) return;
    setLoading(true);

    await axios.delete(`/api/boards/${boardToDelete.id}`);

    toast.warning("Board deletado com sucesso!", {
      position: "top-right",
      duration: 2000,
      style: {
        borderRadius: "10px",
        background: "#e9eda0",
        color: "#181818",
        fontWeight: "bold",
      },
    });

    mutate(boards.filter((b) => b.id !== boardToDelete.id));
    setBoardToDelete(null);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4 mt-10">
      
      <h1 className="text-2xl font-bold text-gray-600">Seus Quadros</h1>

      <div className="flex gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FiGrid className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{boards.length}</p>
            <p className="text-xs text-gray-500">Boards</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FiList className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalLists}</p>
            <p className="text-xs text-gray-500">Listas</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FiCheckSquare className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalCards}</p>
            <p className="text-xs text-gray-500">Cards</p>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-gray-200">Carregando...</p>}
        {!isLoading && boards.length === 0 && <p className="text-gray-200">Nenhum board criado ainda.</p>}
        {!isLoading && boards.map((board) => (
          <li key={board.id}>
            <Link
              href={`/dashboard/boards/${board.id}`}
              className="p-4 rounded-lg shadow-2xl border border-blue-400/50 bg-blue-400/50 hover:bg-blue-500 transition flex justify-between"
            >
              <div className="flex gap-2">
                <FiGrid size={24} />
                <p className="font-bold capitalize">{board.title}</p>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBoardToDelete(board);
                }}
                className="text-gray-200 hover:text-red-500 transition"
              >
                <FiTrash size={24} />
              </button>
            </Link>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {boardToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">
              Deletar Board
            </h2>

            <p className="text-gray-400 mb-6">
              Tem certeza que deseja deletar{" "}
              <span className="font-semibold text-white">
                {boardToDelete.title}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBoardToDelete(null)}
                className="cursor-pointer px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </button>

              <button
                onClick={handleDelete}
                className="cursor-pointer px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
