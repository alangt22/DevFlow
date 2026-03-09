"use client";

import useSWR from "swr";
import axios from "axios";
import { Lists } from "./list";
import { CreateList } from "./create-list";

interface Board {
  id: string;
  title: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function BoardDetail({ boardId }: { boardId: string }) {
  const { data: board, isLoading } = useSWR<Board>(
    boardId ? `/api/boards/${boardId}` : null,
    fetcher
  );

  return (
    <div className="p-4 min-h-screen ">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-white">{board?.title}</h1>
      </div>
      {isLoading && <p className="text-white">Carregando...</p>}

      <CreateList boardId={boardId} />
      <Lists boardId={boardId} />
    </div>
  );
}
