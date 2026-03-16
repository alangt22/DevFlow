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

  const updates = body as { id: string; order: number }[]

  const queries = updates.map((card) =>
    prisma.card.update({
      where: { id: card.id },
      data: { order: card.order },
    })
  )

  await prisma.$transaction(queries)

  if (!updates || updates.length === 0) {
    return NextResponse.json({ success: true })
  }

  const firstCard = await prisma.card.findFirst({
    where: { id: updates[0].id },
    select: { listId: true },
  })

  if (firstCard) {
    const list = await prisma.list.findUnique({
      where: { id: firstCard.listId },
      select: { boardId: true },
    })

    if (list) {
      await pusherServer.trigger(`board-${list.boardId}`, "card-reordered", {
        listId: firstCard.listId,
      })
    }
  }

  return NextResponse.json({ success: true })
}