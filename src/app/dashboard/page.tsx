
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateBoard } from "./_components/create-board";
import { BoardsList } from "./_components/boards-list";


export default async function Dashboard() {
  
    const session = await auth();

    if (!session) {
        redirect("/");
    }

  return (
    <div className="">
      <h1 className="text-2xl font-bold capitalize">Bem-vindo, {session.user?.name}</h1>
      <p className="text-gray-500 mb-20">{session.user?.email}</p>

      <CreateBoard />
      <BoardsList />
    </div>
  )
}
