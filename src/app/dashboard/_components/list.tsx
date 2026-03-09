"use client";

import useSWR from "swr";
import axios from "axios";
import { CreateCard } from "./create-card";
import { CardList } from "./card-list";
import { FiEdit, FiPlus } from "react-icons/fi";
import { useState } from "react";
import { toast } from "sonner";

interface List {
  id: string;
  title: string;
  order: number;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function Lists({ boardId }: { boardId: string }) {
  const {
    data: lists = [],
    isLoading,
    mutate,
  } = useSWR<List[]>(boardId ? `/api/lists?boardId=${boardId}` : null, fetcher);

  const [listToDelete, setListToDelete] = useState<List | null>(null);
  const [listToUpdate, setListToUpdate] = useState<List | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!listToDelete) return;
    setLoading(true);

    await axios.delete(`/api/lists/${listToDelete.id}`);

    toast.success("Lista deletada com sucesso!", {
      position: "top-right",
      duration: 2000,
      style: {
        borderRadius: "10px",
        background: "#29e251",
        color: "#ffffff",
        fontWeight: "bold",
      },
    });

    mutate(lists.filter((l) => l.id !== listToDelete.id));
    setListToDelete(null);
    setLoading(false);
  }

  async function handleUpdate() {
    if (!listToUpdate) return;
    setLoading(true);

    await axios.put(`/api/lists/${listToUpdate.id}`, {
      title: listToUpdate.title,
    });

    toast.success("Lista atualizada com sucesso!", {
      position: "top-right",
      duration: 2000,
      style: {
        borderRadius: "10px",
        background: "#29e251",
        color: "#ffffff",
        fontWeight: "bold",
      },
    });

    mutate(lists.map((l) => (l.id === listToUpdate.id ? listToUpdate : l)));
    setListToUpdate(null);
    setLoading(false);
  }

  return (
    <div className="flex gap-3 flex-wrap overflow-x-hidden pb-4 px-1 mt-10">
      {isLoading && <p className="text-gray-200">Carregando...</p>}
      {!isLoading && lists.length === 0 && (
        <p className="text-gray-400">Nenhuma lista criada ainda.</p>
      )}
      {!isLoading &&
        lists.map((list) => (
          <div
            key={list.id}
            className="min-w-[272px] max-w-[272px] bg-[#f4f5f7] rounded-lg p-2 flex flex-col"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 px-2 py-1.5 capitalize">
                {list.title}
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setListToUpdate(list)}
                 className="text-gray-600 hover:text-blue-300 cursor-pointer">
                  <FiEdit size={18} />
                </button>
                <button
                  onClick={() => setListToDelete(list)}
                  className="text-gray-600 hover:text-red-500 text-2xl font-bold cursor-pointer"
                >
                  x
                </button>
              </div>
            </div>

            <div className="border-b border-gray-500 mb-2"></div>

            {listToDelete && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/60">
                <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-700 shadow-lg">
                  <h2 className="text-lg font-semibold mb-2">Deletar Lista</h2>

                  <p className="text-gray-400 mb-6">
                    Tem certeza que deseja deletar{" "}
                    <span className="font-semibold text-white">
                      {listToDelete.title}
                    </span>
                    ?
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setListToDelete(null)}
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

            {listToUpdate && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/60">
                <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-700 shadow-lg">
                  <h2 className="text-lg font-semibold mb-2">Atualizar Lista</h2>

                  <input
                    type="text"
                    value={listToUpdate.title}
                    onChange={(e) =>
                      setListToUpdate({ ...listToUpdate, title: e.target.value })
                    }
                    className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700 text-white"
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setListToUpdate(null)}
                      className="cursor-pointer px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      Cancelar
                    </button>

                    <button
                      onClick={handleUpdate}
                      className="cursor-pointer px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? "Atualizando..." : "Atualizar"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <CardList listId={list.id} />
            <CreateCard listId={list.id} />
          </div>
        ))}
    </div>

  );
}   
