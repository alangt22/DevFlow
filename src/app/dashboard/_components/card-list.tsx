"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import { useState } from "react";
import { FiEdit2, FiTrash } from "react-icons/fi";
import { toast } from "sonner";
import { mutate } from "swr";

interface Card {
  id: string;
  title: string;
  order: number;
  listId: string;
  description?: string;
}

function SortableCard({
  card,
  onUpdatecard,
  onDeleteCard,
}: {
  card: Card;
  onUpdatecard: (updatedCard: Card) => void;
  onDeleteCard: (deletedCard: Card) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded-md bg-gray-300 shadow-lg border mb-2 border-gray-400 hover:bg-gray-400"
    >
      <div className="flex items-center justify-between">
        {/* AREA DRAG */}
        <p
          {...attributes}
          {...listeners}
          className="text-gray-800 text-sm font-bold cursor-grab active:cursor-grabbing"
        >
          {card.title}
        </p>

        {/* BOTOES */}
        <div className="flex gap-2">
          <button
            onClick={() => onUpdatecard(card)}
            className="text-xs text-gray-600 hover:text-blue-500 cursor-pointer"
          >
            <FiEdit2 size={18} />
          </button>
          <button
            onClick={() => onDeleteCard(card)}
            className="text-xs text-gray-600 hover:text-red-500 cursor-pointer"
          >
            <FiTrash size={18} />
          </button>
        </div>
      </div>
      <div className="mt-2 font-light">
        {card.description && (
          <p className="text-gray-600 text-xs mt-2">{card.description}</p>
        )}
      </div>
    </div>
  );
}

interface CardListProps {
  cards: Card[];
  onCardDeleted?: (cardId: string) => void;
  onCardUpdated?: (card: Card) => void;
}

export function CardList({ cards, onCardDeleted, onCardUpdated }: CardListProps) {
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [cardToUpdate, setCardToUpdate] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);

  function openDeleteModal(card: Card) {
    setCardToDelete(card);
  }
  function openUpdateModal(card: Card) {
    setCardToUpdate(card);
  }
  async function handleDeleteCard(cardToDelete: Card) {
    if (!cardToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/cards/${cardToDelete.id}`);
      mutate((key) => typeof key === "string" && key.startsWith("/api/cards"));
      toast.success("Card deletado!", {
        position: "top-right",
        duration: 2000,
      });

      onCardDeleted?.(cardToDelete.id);
      setCardToDelete(null);
    } catch {
      toast.error("Erro ao deletar card");
    } finally {
      setLoading(false);
    }
  }
  async function handleUpdateCard(updatedCard: Card) {
      if (!updatedCard) return;
    setLoading(true);
    try {
      await axios.put(`/api/cards/${updatedCard.id}`,{
        title: updatedCard.title,
        description: updatedCard.description
      });
      mutate((key) => typeof key === "string" && key.startsWith("/api/cards"));
      toast.success("Card Atualizado!", {
        position: "top-right",
        duration: 2000,
      });

      onCardUpdated?.(updatedCard);
      setCardToUpdate(null);
    } catch {
      toast.error("Erro ao atualizar card");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[50px]">
      {sortedCards.length === 0 && (
        <p className="text-gray-400 text-sm italic p-2">Nenhum card</p>
      )}
      <SortableContext
        items={sortedCards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        {sortedCards.map((card) => (
          <SortableCard
            key={card.id}
            card={card}
            onUpdatecard={openUpdateModal}
            onDeleteCard={openDeleteModal}
          />
        ))}
      </SortableContext>

      {cardToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-700">
            <h2 className="text-lg font-semibold mb-2">Deletar Lista</h2>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja deletar{" "}
              <span className="font-semibold text-white">
                {cardToDelete.title}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCardToDelete(null)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCard(cardToDelete!)}
                disabled={loading}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
              >
                {loading ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cardToUpdate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-700">
            <h2 className="text-lg font-semibold mb-2">Atualizar Card</h2>
            <input
              type="text"
              value={cardToUpdate.title}
              onChange={(e) =>
                setCardToUpdate({ ...cardToUpdate, title: e.target.value })
              }
              className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700 text-white"
            />

            <textarea
              placeholder="Comentários"
              value={cardToUpdate.description ?? ""}
              onChange={(e) =>
                setCardToUpdate({
                  ...cardToUpdate,
                  description: e.target.value,
                })
              }
              className="w-full h-40 p-2 mb-4 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCardToUpdate(null)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdateCard(cardToUpdate!)}
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
