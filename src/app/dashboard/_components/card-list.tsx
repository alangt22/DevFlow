"use client";

import useSWR from "swr";
import axios from "axios";

interface Card {
  id: string
  title: string
  description?: string
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function CardList({ listId }: { listId: string }) {
  const { data: cards = [], isLoading } = useSWR<Card[]>(
    listId ? `/api/cards?listId=${listId}` : null,
    fetcher
  );

  return (
    <div className="flex flex-col">
      {isLoading && <p className="text-gray-500 text-sm">Carregando...</p>}
      {!isLoading && cards.length === 0 && <p className="text-gray-400 text-sm italic">Nenhum card</p>}
      {!isLoading && cards.map((card) => (
        <div 
          key={card.id} 
          className="p-3 rounded-md bg-gray-300 shadow-lg hover:shadow-md cursor-pointer transition-all border mb-2 border-gray-400 hover:bg-gray-400"
        >
          <p className="text-gray-800 text-sm font-medium">{card.title}</p>
        </div>
      ))}
    </div>
  );
}
