import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { createBoardSchema } from "@/lib/validations/board.schema"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function POST(req: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()

  const result = createBoardSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    )
  }

  const board = await prisma.board.create({
    data: {
      title: result.data.title,
      userId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        }
      }
    },
  })

  revalidatePath("/dashboard") // Revalida a rota do dashboard para atualizar a lista de boards

  return NextResponse.json(board)
}

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  

  const boards = await prisma.board.findMany({
    where: {
      OR: [
        {userId: session.user.id},
        {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      ]
    },
    orderBy: { createdAt: "desc" }
  })
  

  revalidatePath("/dashboard")

  return NextResponse.json(boards)
}
