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

  if (!updates || updates.length === 0) {
    return NextResponse.json({ success: true })
  }

  const queries = updates.map((list) =>
    prisma.list.update({
      where: { id: list.id },
      data: { order: list.order },
    })
  )

  await prisma.$transaction(queries)

  const firstList = await prisma.list.findFirst({
    where: { id: updates[0].id },
    select: { boardId: true },
  })

  if (firstList) {
    await pusherServer.trigger(`board-${firstList.boardId}`, "list-reordered", {
      boardId: firstList.boardId,
    })
  }

  return NextResponse.json({ success: true })
}
