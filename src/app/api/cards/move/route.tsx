import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { cardId, newListId } = await req.json();

  if (!cardId || !newListId) {
    return NextResponse.json(
      { error: "cardId e newListId são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    // pega o último card da lista destino
    const lastCard = await prisma.card.findFirst({
      where: { listId: newListId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastCard ? lastCard.order + 1 : 0;

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        listId: newListId,
        order: newOrder,
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao mover card" },
      { status: 500 }
    );
  }
}