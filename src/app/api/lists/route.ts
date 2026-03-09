import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createListSchema } from "@/lib/validations/list.schema"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const boardId = searchParams.get("boardId")

  if (!boardId) {
    return NextResponse.json({ error: "boardId é obrigatório" }, { status: 400 })
  }

  const lists = await prisma.list.findMany({
    where: { boardId }, 
    orderBy: { order: "asc" },
    include: { cards: true },
  })

  return NextResponse.json(lists)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const parse = createListSchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 })

  const count = await prisma.list.count({ where: { boardId: parse.data.boardId } })

  const list = await prisma.list.create({
    data: {
      title: parse.data.title,
      boardId: parse.data.boardId,
      order: count, // adiciona no final
    },
  })

  return NextResponse.json(list)
}