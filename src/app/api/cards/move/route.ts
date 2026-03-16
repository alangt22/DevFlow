import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"

export async function PUT(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { cardId, newListId } = body

  if (!cardId || !newListId) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const card = await prisma.card.findUnique({
    where: { id: cardId },
  })

  if (!card) {
    return NextResponse.json({ error: "Card não encontrado" }, { status: 404 })
  }

  await prisma.card.update({
    where: { id: cardId },
    data: { listId: newListId },
  })


  const list = await prisma.list.findUnique({
    where: { id: newListId },
    select: { boardId: true },
  })



  if (!list) {
    return NextResponse.json({ error: "Lista não encontrada" }, { status: 404 });
  }

  try {
    await pusherServer.trigger(`board-${list.boardId}`, "card-moved", {
      cardId,
      newListId,
    });
  } catch (error) {
    console.error("Error triggering card-moved event:", error);
  }

  return NextResponse.json({ success: true })
}
