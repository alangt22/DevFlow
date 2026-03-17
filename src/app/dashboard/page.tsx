import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateBoard } from "./_components/create-board";
import { BoardsList } from "./_components/boards-list";
import Image from "next/image";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <section>
      
      <div className="flex mb-10">
        <div className="p-2">
          <Image
            src={session.user?.image || ""}
            alt={session.user?.name || ""}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="flex flex-col p-1">
          <h1 className="text-2xl text-gray-800 font-bold capitalize">
            Bem-vindo, {session.user?.name}
          </h1>
          <p className="text-gray-500 mb-20">{session.user?.email}</p>
        </div>
      </div>


      <CreateBoard />
      <BoardsList />
    </section>
  );
}
