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


  if (!id) {
    return NextResponse.json({ error: "ID não enviado" }, { status: 400 });
  }

  const card = await prisma.card.findUnique({
    where: { id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card não encontrado" }, { status: 404 });
  }

  await prisma.card.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const { title, description } = await req.json();



  if (!id) {
    return NextResponse.json({ error: "ID não enviado" }, { status: 400 });
  }

  const card = await prisma.card.findUnique({
    where: { id},
  });

  if (!card) {
    return NextResponse.json({ error: "Card não encontrada" }, { status: 404 });
  }

  const updateCard = await prisma.card.update({
    where: { id },
    data: { 
      title,
      description: description 
     },
  });


  return NextResponse.json(updateCard);
}