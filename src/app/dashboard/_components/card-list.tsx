"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

interface Card {
  id: string;
  title: string;
  order: number;
  listId: string;
  description?: string;
}

function SortableCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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

interface CardListProps {
  cards: Card[];
}

export function CardList({ cards }: CardListProps) {
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

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
          <SortableCard key={card.id} card={card} />
        ))}
      </SortableContext>
    </div>
  );
}
