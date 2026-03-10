"use client";

import useSWR from "swr";
import axios from "axios";
import { CreateCard } from "./create-card";
import { CardList } from "./card-list";
import { FiEdit, FiMove } from "react-icons/fi";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";

interface List {
  id: string;
  title: string;
  order: number;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Componente de lista arrastável
function SortableList({
  list,
  onUpdate,
  onDelete,
}: {
  list: List;
  onUpdate: (list: List) => void;
  onDelete: (list: List) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "all ease", 
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="min-w-[272px] max-w-[272px] bg-[#f4f5f7] rounded-lg p-2 flex flex-col"
    >
      {/* Cabeçalho da lista */}
      <div className="flex justify-between items-center">
        {/* Alça de drag */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab"
        >
          <FiMove size={18} className="text-gray-500" />
          <h2 className="font-semibold text-gray-800 uppercase">{list.title}</h2>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-4">
          <button
            onClick={() => onUpdate(list)}
            className="text-gray-600 hover:text-blue-300 cursor-pointer"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => onDelete(list)}
            className="text-gray-600 hover:text-red-500 text-2xl font-bold cursor-pointer"
          >
            x
          </button>
        </div>
      </div>

      <div className="border-b border-gray-500 mb-2"></div>

      {/* Cards e criação de cards */}
      <CardList listId={list.id} />
      <CreateCard listId={list.id} />
    </div>
  );
}

// Componente principal de listas
export function Lists({ boardId }: { boardId: string }) {
  const { data: lists = [], isLoading, mutate } = useSWR<List[]>(
    boardId ? `/api/lists?boardId=${boardId}` : null,
    fetcher
  );

  const [items, setItems] = useState<List[]>([]);
  const [listToDelete, setListToDelete] = useState<List | null>(null);
  const [listToUpdate, setListToUpdate] = useState<List | null>(null);
  const [loading, setLoading] = useState(false);

  // Sincroniza estado local com SWR
  useEffect(() => {
    if (lists.length) {
      const sorted = [...lists].sort((a, b) => a.order - b.order);
      setItems(sorted);
    }
  }, [lists]);

  // Drag & Drop
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Atualiza ordem no backend
    try {
      const payload = newItems.map((card, index) => ({
        id: card.id,
        order: index,
      }));
      await axios.put("/api/lists/reorder", payload);
      mutate();
    } catch {
      toast.error("Erro ao reordenar listas");
    }
  }

  // Deletar lista
  async function handleDelete() {
    if (!listToDelete) return;
    setLoading(true);

    try {
      await axios.delete(`/api/lists/${listToDelete.id}`);
      toast.success("Lista deletada com sucesso!", {
        position: "top-right",
        duration: 2000,
        style: { borderRadius: "10px", background: "#29e251", color: "#fff", fontWeight: "bold" },
      });
      mutate(lists.filter((l) => l.id !== listToDelete.id));
      setListToDelete(null);
    } catch {
      toast.error("Erro ao deletar lista");
    } finally {
      setLoading(false);
    }
  }

  // Atualizar lista
  async function handleUpdate() {
    if (!listToUpdate) return;
    setLoading(true);

    try {
      await axios.put(`/api/lists/${listToUpdate.id}`, { title: listToUpdate.title });
      toast.success("Lista atualizada com sucesso!", {
        position: "top-right",
        duration: 2000,
        style: { borderRadius: "10px", background: "#29e251", color: "#fff", fontWeight: "bold" },
      });
      mutate(lists.map((l) => (l.id === listToUpdate.id ? listToUpdate : l)));
      setListToUpdate(null);
    } catch {
      toast.error("Erro ao atualizar lista");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-3 flex-wrap overflow-x-auto pb-4 px-1 mt-10">
      {isLoading && <p className="text-gray-200">Carregando...</p>}
      {!isLoading && items.length === 0 && <p className="text-gray-400">Nenhuma lista criada ainda.</p>}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((list) => list.id)} strategy={rectSortingStrategy}>
          {items.map((list) => (
            <SortableList
              key={list.id}
              list={list}
              onUpdate={(l) => setListToUpdate(l)}
              onDelete={(l) => setListToDelete(l)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Modal Deletar */}
      {listToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Deletar Lista</h2>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja deletar <span className="font-semibold text-white">{listToDelete.title}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setListToDelete(null)} className="cursor-pointer px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancelar</button>
              <button onClick={handleDelete} disabled={loading} className="cursor-pointer px-4 py-2 rounded bg-red-600 hover:bg-red-700">{loading ? "Deletando..." : "Deletar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atualizar */}
      {listToUpdate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Atualizar Lista</h2>
            <input
              type="text"
              value={listToUpdate.title}
              onChange={(e) => setListToUpdate({ ...listToUpdate, title: e.target.value })}
              className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setListToUpdate(null)} className="cursor-pointer px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancelar</button>
              <button onClick={handleUpdate} disabled={loading} className="cursor-pointer px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">{loading ? "Atualizando..." : "Atualizar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}