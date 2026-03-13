import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { createCardSchema } from "@/lib/validations/card.schema"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const listId = searchParams.get("listId")

  if (!listId) {
    return NextResponse.json({ error: "listId é obrigatório" }, { status: 400 })
  }

  const cards = await prisma.card.findMany({
    where: { listId },
    orderBy: { order: "asc" },
  })

  return NextResponse.json(cards)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const parse = createCardSchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 })

  const count = await prisma.card.count({ where: { listId: parse.data.listId } })

  const card = await prisma.card.create({
    data: {
      title: parse.data.title,
      listId: parse.data.listId,
      order: count, // adiciona no final da lista
    },
  })

  const listWithBoard = await prisma.list.findUnique({
    where: { id: parse.data.listId },
    select: { boardId: true },
  })

  if (listWithBoard) {
    await pusherServer.trigger(
      `board-${listWithBoard.boardId}`,
      "card-created",
      card
    )
  }

  return NextResponse.json(card)
}