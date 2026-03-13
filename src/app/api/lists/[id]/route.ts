import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "ID não enviado" }, { status: 400 });
  }

  const list = await prisma.list.findUnique({
    where: { id },
  });

  if (!list) {
    return NextResponse.json(
      { error: "Lista não encontrada" },
      { status: 404 },
    );
  }

  await prisma.list.delete({
    where: { id },
  });

  await pusherServer.trigger(`board-${list.boardId}`, "list-updated", list);

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const { title } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID não enviado" }, { status: 400 });
  }

  const list = await prisma.list.findUnique({
    where: { id },
  });

  if (!list) {
    return NextResponse.json(
      { error: "Lista não encontrada" },
      { status: 404 },
    );
  }

  const updatedList = await prisma.list.update({
    where: { id },
    data: { title },
  });

  await pusherServer.trigger(`board-${list.boardId}`, "list-updated", list);

  return NextResponse.json(updatedList);
}
