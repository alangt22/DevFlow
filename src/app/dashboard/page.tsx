
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";

export default async function Dashboard() {

    const session = await auth();

    if (!session) {
        redirect("/");
    }

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p>Bem-vindo, {session.user?.name}</p>
      <p className="text-gray-500">{session.user?.email}</p>
      {session.user?.image && (
        <img 
          src={session.user.image} 
          alt="Avatar" 
          className="w-16 h-16 rounded-full mt-2"
        />
      )}
      <LogoutButton />
    </div>
  )
}