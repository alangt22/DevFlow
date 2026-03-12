import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BoardDetail } from "../../_components/board-detail";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/"); // não logado
  }

  const { id } = await params;
  console.log("Board ID from URL:", id);

  // Busca a board e inclui os membros
  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!board) {
    redirect("/dashboard"); // board não encontrada
  }

  // Checa se o usuário é dono ou membro
  const isOwner = board.members.some(
    (member) => member.userId === session.user.id && member.role === "OWNER"
  );

  const isMember = board.members.some(
    (member) => member.userId === session.user.id
  );

  if (!isOwner && !isMember) {
    redirect("/dashboard"); // não é dono nem membro
  }

  // Usuário autorizado
  return (
    <div>
      <Link
        href="/dashboard"
        className="text-blue-500 hover:text-white mb-4 inline-block"
      >
        &larr; Voltar para o Dashboard
      </Link>

      <BoardDetail boardId={id} userEmail={session.user.email} />
    </div>
  );
}