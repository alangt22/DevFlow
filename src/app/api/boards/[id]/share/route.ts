import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { userId } = await req.json();

    const { id: boardId } = await context.params;

    if (!boardId || !userId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    

    // verificar se a board existe
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return NextResponse.json(
        { error: "Board não encontrada" },
        { status: 404 },
      );
    }

    // evitar membro duplicado
    const existingMember = await prisma.boardMember.findFirst({
      where: {
        boardId,
        userId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro da board" },
        { status: 400 },
      );
    }

    const member = await prisma.boardMember.create({
      data: {
        boardId,
        userId,
        role: "MEMBER",
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {

    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { userId } = await req.json()

    const { id: boardId } = await context.params

    if (!boardId || !userId) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    const userToRemove = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    await prisma.boardMember.deleteMany({
      where: {
        boardId,
        userId
      }
    })

    await pusherServer.trigger(`board-${boardId}`, "member-removed", {
      removedUserEmail: userToRemove?.email,
    });

    return NextResponse.json({ message: "Membro removido" })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}