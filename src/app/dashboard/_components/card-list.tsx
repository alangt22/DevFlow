"use client";

import useSWR from "swr";
import axios from "axios";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";

interface Card {
  id: string;
  title: string;
  order: number;
  description?: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function SortableCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 rounded-md bg-gray-300 shadow-lg border mb-2 
  border-gray-400 hover:bg-gray-400 cursor-grab active:cursor-grabbing"
    >
      <p className="text-gray-800 text-sm font-medium">{card.title}</p>
    </div>
  );
}

export function CardList({ listId }: { listId: string }) {
  const { data: cards = [], isLoading } = useSWR<Card[]>(
    listId ? `/api/cards?listId=${listId}` : null,
    fetcher,
  );

  const [items, setItems] = useState<Card[]>([]);

  useEffect(() => {
    if (cards.length) {
      setItems(cards);
    }
  }, [cards]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);

    setItems(newItems);

    const payload = newItems.map((card, index) => ({
      id: card.id,
      order: index,
    }));

    await axios.put("/api/cards/reorder", payload);
  }

  return (
    <div className="flex flex-col">
      {isLoading && <p className="text-gray-500 text-sm">Carregando...</p>}
      {!isLoading && cards.length === 0 && (
        <p className="text-gray-400 text-sm italic">Nenhum card</p>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={items.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((card) => (
            <SortableCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
