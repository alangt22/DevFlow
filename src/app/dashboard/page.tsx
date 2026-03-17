import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateBoard } from "./_components/create-board";
import { BoardsList } from "./_components/boards-list";
import { RightPanel } from "./_components/right-panel";
import Image from "next/image";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="gap-8 max-w-7xl mx-auto lg:flex">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-8">
          <Image
            src={session.user?.image || ""}
            alt={session.user?.name || ""}
            width={50}
            height={50}
            className="rounded-full"
          />
          <div>
            <h1 className="text-2xl text-gray-800 font-bold capitalize">
              Bem-vindo, {session.user?.name}
            </h1>
            <p className="text-gray-500">{session.user?.email}</p>
          </div>
        </div>

        <CreateBoard />
        <BoardsList />
      </div>
      <div className="mt-12">
        <RightPanel />
      </div>

      
    </div>
  );
}
