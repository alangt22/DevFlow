import { auth } from "@/lib/auth"
import { redirect } from "next/navigation";
import { BoardDetail } from "../../_components/board-detail";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: Props) {

    const session = await auth();

    if (!session) {
        redirect("/");
    }

    const { id } = await params;
    console.log("Board ID from URL:", id);

  return (
    <div>
      <Link href="/dashboard" className="text-blue-500 hover:text-white mb-4 inline-block">
        &larr; Voltar para o Dashboard
      </Link>

      <BoardDetail boardId={id} />
    </div>
  )
}
