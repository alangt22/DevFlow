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
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  useDroppable,
  UniqueIdentifier,
} from "@dnd-kit/core";

interface Card {
  id: string;
  title: string;
  order: number;
  listId: string;
  description?: string;
}

interface List {
  id: string;
  title: string;
  order: number;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Componente para área droppable da lista - onde os cards podem ser soltos
function DroppableList({
  listId,
  children,
}: {
  listId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: listId });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 transition-colors duration-200 ${isOver ? "bg-blue-50/50" : ""}`}
    >
      {children}
    </div>
  );
}

function SortableList({
  list,
  cards,
  onUpdate,
  onDelete,
  isOverlay,
}: {
  list: List;
  cards: Card[];
  onUpdate: (list: List) => void;
  onDelete: (list: List) => void;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "all 200ms ease",
    opacity: isDragging ? 0.5 : 1,
  };

  if (isOverlay) {
    return (
      <div className="min-w-[272px] max-w-[272px] bg-[#f4f5f7] rounded-lg p-2 flex flex-col shadow-2xl scale-105 rotate-1 border-2 border-blue-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-grabbing">
            <FiMove size={18} className="text-blue-500" />
            <h2 className="font-semibold text-gray-800 uppercase">
              {list.title}
            </h2>
          </div>
        </div>
        <div className="border-b border-gray-500 mb-2"></div>
        <CardList cards={cards} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="min-w-[272px] max-w-[272px] bg-[#f4f5f7] rounded-lg p-2 flex flex-col"
    >
      <div className="flex justify-between items-center">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
        >
          <FiMove size={18} className="text-gray-500" />
          <h2 className="font-semibold text-gray-800 uppercase">
            {list.title}
          </h2>
        </div>

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
      <DroppableList listId={list.id}>
        <CardList cards={cards} />
      </DroppableList>
      <CreateCard listId={list.id} />
    </div>
  );
}

export function Lists({ boardId }: { boardId: string }) {
  const {
    data: lists = [],
    isLoading,
    mutate: mutateLists,
  } = useSWR<List[]>(boardId ? `/api/lists?boardId=${boardId}` : null, fetcher);
  const [items, setItems] = useState<List[]>([]);
  const [listToDelete, setListToDelete] = useState<List | null>(null);
  const [listToUpdate, setListToUpdate] = useState<List | null>(null);
  const [loading, setLoading] = useState(false);

  const [cardsMap, setCardsMap] = useState<Record<string, Card[]>>({});
  const [activeItem, setActiveItem] = useState<{
    type: "list" | "card";
    data: List | Card;
  } | null>(null);

  useEffect(() => {
    if (lists.length) {
      const sorted = [...lists].sort((a, b) => a.order - b.order);
      setItems(sorted);
    }
  }, [lists]);

  useEffect(() => {
    async function loadCards() {
      const cardsData: Record<string, Card[]> = {};
      for (const list of items) {
        const cards = await fetcher(`/api/cards?listId=${list.id}`);
        cardsData[list.id] = cards;
      }
      setCardsMap(cardsData);
    }
    if (items.length > 0) {
      loadCards();
    }
  }, [items]);

  function handleDragStart(event: { active: { id: UniqueIdentifier } }) {
    const activeId = String(event.active.id);
    const list = items.find((l) => l.id === activeId);
    if (list) {
      setActiveItem({ type: "list", data: list });
      return;
    }
    for (const listId of Object.keys(cardsMap)) {
      const card = cardsMap[listId].find((c) => c.id === activeId);
      if (card) {
        setActiveItem({ type: "card", data: card });
        return;
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveItem(null);

    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const isDraggingList = items.some((l) => l.id === activeId);

    if (isDraggingList) {
      const oldIndex = items.findIndex((l) => l.id === activeId);
      const newIndex = items.findIndex((l) => l.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      try {
        await axios.put(
          "/api/lists/reorder",
          newItems.map((l, i) => ({ id: l.id, order: i })),
        );
        mutateLists();
      } catch {
        toast.error("Erro ao reordenar listas");
      }
      return;
    }

    const sourceListId = Object.keys(cardsMap).find((listId) =>
      cardsMap[listId].some((c) => c.id === activeId),
    );
    if (!sourceListId) return;

    let targetListId: string | null = null;
    let targetIndex = -1;

    if (items.some((l) => l.id === overId)) {
      targetListId = overId;
      targetIndex = cardsMap[overId]?.length || 0;
    } else {
      for (const listId of Object.keys(cardsMap)) {
        const idx = cardsMap[listId].findIndex((c) => c.id === overId);
        if (idx !== -1) {
          targetListId = listId;
          targetIndex = idx;
          break;
        }
      }
    }

    if (!targetListId) return;

    const sourceCards = [...(cardsMap[sourceListId] || [])];
    const targetCards =
      sourceListId === targetListId
        ? sourceCards
        : [...(cardsMap[targetListId] || [])];

    const cardIndex = sourceCards.findIndex((c) => c.id === activeId);
    if (cardIndex === -1) return;

    const [movedCard] = sourceCards.splice(cardIndex, 1);

    if (sourceListId === targetListId) {
      targetCards.splice(targetIndex, 0, movedCard);
      const reordered = targetCards.map((c, i) => ({ ...c, order: i }));
      setCardsMap((prev) => ({ ...prev, [sourceListId]: reordered }));

      try {
        await axios.put(
          "/api/cards/reorder",
          reordered.map((c, i) => ({ id: c.id, order: i })),
        );
      } catch {
        toast.error("Erro ao reordenar cards");
      }
    } else {
      movedCard.listId = targetListId;
      targetCards.splice(targetIndex, 0, movedCard);

      const reorderedSource = sourceCards.map((c, i) => ({ ...c, order: i }));
      const reorderedTarget = targetCards.map((c, i) => ({ ...c, order: i }));

      setCardsMap((prev) => ({
        ...prev,
        [sourceListId]: reorderedSource,
        [targetListId]: reorderedTarget,
      }));

      try {
        await axios.put("/api/cards/move", {
          cardId: activeId,
          newListId: targetListId,
        });
        await axios.put(
          "/api/cards/reorder",
          reorderedSource.map((c, i) => ({ id: c.id, order: i })),
        );
      } catch {
        toast.error("Erro ao mover card");
      }
    }
  }

  async function handleDelete() {
    if (!listToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/lists/${listToDelete.id}`);
      toast.success("Lista deletada!", {
        position: "top-right",
        duration: 2000,
      });
      mutateLists(lists.filter((l) => l.id !== listToDelete.id));
      setListToDelete(null);
    } catch {
      toast.error("Erro ao deletar lista");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!listToUpdate) return;
    setLoading(true);
    try {
      await axios.put(`/api/lists/${listToUpdate.id}`, {
        title: listToUpdate.title,
      });
      toast.success("Lista atualizada!", {
        position: "top-right",
        duration: 2000,
      });
      mutateLists(
        lists.map((l) => (l.id === listToUpdate.id ? listToUpdate : l)),
      );
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
      {!isLoading && items.length === 0 && (
        <p className="text-gray-400">Nenhuma lista criada ainda.</p>
      )}

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((l) => l.id)}
          strategy={rectSortingStrategy}
        >
          {items.map((list) => (
            <SortableList
              key={list.id}
              list={list}
              cards={cardsMap[list.id] || []}
              onUpdate={(l) => setListToUpdate(l)}
              onDelete={(l) => setListToDelete(l)}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeItem?.type === "list" && (
            <SortableList
              list={activeItem.data as List}
              cards={cardsMap[(activeItem.data as List).id] || []}
              onUpdate={() => {}}
              onDelete={() => {}}
              isOverlay
            />
          )}
          {activeItem?.type === "card" && (
            <div className="p-3 rounded-md bg-gray-300 shadow-2xl scale-105 rotate-1 border-2 border-blue-500 cursor-grabbing">
              <p className="text-gray-800 text-sm font-medium">
                {(activeItem.data as Card).title}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {listToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-700">
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
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
              >
                {loading ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {listToUpdate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-700">
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
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Atualizando..." : "Atualizar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
