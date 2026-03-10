import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

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

  return NextResponse.json({ success: true })
}