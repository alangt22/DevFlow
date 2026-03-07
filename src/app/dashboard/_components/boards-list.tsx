"use client";

import { getBoards } from "@/lib/getBoards";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiTrash } from "react-icons/fi";
import { toast } from "sonner";

interface Board {
  id: string;
  title: string;
}

export function BoardsList() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getBoards();
      setBoards(data);
    }
    load();
  }, []);

  async function handleDelete() {
    if (!boardToDelete) return;

    await fetch(`/api/boards/${boardToDelete.id}`, {
      method: "DELETE",
    });

    toast.success("Board deletado com sucesso!", {
            position: "top-right",
      duration: 2000,
      style: {
        borderRadius: "10px",
        background: "#29e251",
        color: "#ffffff",
        fontWeight: "bold",
      },
    });

    setBoards((prev) => prev.filter((b) => b.id !== boardToDelete.id));
    setBoardToDelete(null);
  }

  return (
    <div className="flex flex-col gap-4 mt-10">
      
      <h1 className="text-2xl font-bold">Seus Boards</h1>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.length === 0 && <p className="text-gray-200">Nenhum board criado ainda.</p>}
        {boards.map((board) => (
          <li key={board.id}>
            <Link
              href={`/boards/${board.id}`}
              className="p-4 rounded-lg border border-blue-400 bg-blue-600 hover:bg-gray-800 transition flex justify-between"
            >
              <p className="font-semibold">{board.title}</p>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBoardToDelete(board);
                }}
                className="text-gray-200 hover:text-red-500 transition"
              >
                <FiTrash />
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
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
