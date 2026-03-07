import { auth } from "@/lib/auth";
import  prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  console.log("Board ID:", id);

  if (!id) {
    return NextResponse.json({ error: "ID não enviado" }, { status: 400 });
  }

  const board = await prisma.board.findUnique({
    where: { id },
  });

  if (!board) {
    return NextResponse.json({ error: "Board não encontrado" }, { status: 404 });
  }

  await prisma.board.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}