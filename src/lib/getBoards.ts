// src/lib/boards.ts
export interface Board {
  id: string;
  title: string;
}

// Função para pegar todos os boards
export async function getBoards(): Promise<Board[]> {
  const res = await fetch("/api/boards");
  if (!res.ok) throw new Error("Erro ao buscar boards");
  return res.json();
}
