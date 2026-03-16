"use client";

import useSWR, { mutate } from "swr";
import axios from "axios";
import { Lists } from "./list";
import { CreateList } from "./create-list";
import { FiSearch, FiTrash, FiUser } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher-client";

interface Board {
  id: string;
  title: string;
  members: BoardMember[];
}

interface BoardMember {
  role: "OWNER" | "MEMBER";
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface Users {
  id: string;
  name: string;
  email: string;
  image?: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function BoardDetail({
  boardId,
  userEmail,
}: {
  boardId: string;
  userEmail: string;
}) {
  const router = useRouter();
  const { data: board, isLoading } = useSWR<Board>(
    boardId ? `/api/boards/${boardId}` : null,
    fetcher,
  );

  const [isRemoved, setIsRemoved] = useState(false);

  const handleRemove = useCallback(() => {
    setIsRemoved(true);
    toast.error("Você foi removido desta board!", {
      position: "top-right",
      duration: 3000,
      style: {
        borderRadius: "10px",
        background: "#ef4444",
        color: "#ffffff",
        fontWeight: "bold",
      },
    });
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  }, [router]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`board-${boardId}`);

    channel.bind("member-removed", (data: { removedUserEmail: string }) => {
      if (data.removedUserEmail === userEmail) {
        handleRemove();
      }
    });

    return () => {
      pusherClient.unsubscribe(`board-${boardId}`);
    };
  }, [boardId, userEmail, handleRemove]);

  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearchUsers(userEmail: string) {
    try {
      const response = await axios.get(`/api/users/search?email=${userEmail}`);
      setUsers(response.data);
      setEmail("");
    } catch (error) {
      console.error(error);
    }
  }

  async function addMember(userId: string, boardId: string) {
    if (board?.members.find((member) => member.user.id === userId)) {
      toast.warning("Usuário já é membro deste board!", {
        position: "top-right",
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#e9eda0",
          color: "#181818",
        },
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/boards/${boardId}/share`, { userId });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setEmail("");
      toast.success("Usuário adicionado com sucesso!", {
        position: "top-right",
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#29e251",
          color: "#ffffff",
          fontWeight: "bold",
        },
      });
      mutate(`/api/boards/${boardId}`);
    } catch (error) {
      toast.error("Erro ao adicionar usuário");
    }
    setLoading(false);
  }

  async function removeMember(userId: string) {
    try {
      await axios.delete(`/api/boards/${boardId}/share`, { data: { userId } });
      mutate(`/api/boards/${boardId}`);
      toast.warning("Usuário removido com sucesso!", {
        position: "top-right",
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#e9eda0",
          color: "#181818",
          fontWeight: "bold",
        },
      });
      mutate(`/api/boards/${boardId}`);
    } catch (error) {
      console.error(error);
    }
  }

  const isOwner = board?.members.some(
    (member) => member.user.email === userEmail && member.role === "OWNER",
  );

  if (isRemoved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-600">Você foi removido desta board.</p>
          <p className="text-gray-500 mt-2">Redirecionando para o Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen ">
      {/* Título da Board */}
      <div className="flex justify-center items-center my-6">
        <div className="px-10 py-5 rounded-2xl border border-blue-50/80 bg-gradient-to-r from-blue-300 to-blue-500 shadow-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide capitalize">
            {board?.title}
          </h1>
        </div>
      </div>

      {/* Busca de usuários */}
      {isOwner && (
        <div className="mb-8">
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Buscar usuários por email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={() => handleSearchUsers(email)}
              className="p-2 bg-blue-500 rounded-md text-white hover:bg-blue-600 transition"
            >
              <FiSearch size={20} />
            </button>
          </div>

          {/* Lista de usuários encontrados */}
          {users.length > 0 && (
            <div className="space-y-3 mb-6">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 bg-blue-50/15 p-3 rounded-lg shadow hover:shadow-md transition"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 overflow-hidden">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <FiUser size={18} />
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {user.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {user.email}
                      </span>
                    </div>

                    <div>
                      <button
                        onClick={() => addMember(user?.id, boardId)}
                        className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                      >
                        {loading ? "Adicionando..." : "Adicionar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading && <p className="text-gray-700 mb-6">Carregando...</p>}

      {/* MEMBROS DA BOARD */}
      <div className="space-y-3 mb-8">
        {board?.members.map((member) => (
          <div
            key={member.user.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/10 shadow hover:shadow-md transition"
          >
            {/* Avatar */}
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 overflow-hidden">
              {member.user.image ? (
                <Image
                  src={member.user.image}
                  alt={member.user.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser size={18} />
              )}
            </div>

            {/* Nome e email */}
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">
                {member.user.name}
              </span>
              <span className="text-sm text-gray-500">{member.user.email}</span>
            </div>

            {/* Badge role */}
            <div className="ml-auto flex flex-col items-end gap-1">
              {member.role === "MEMBER" && isOwner && (
                <button
                  onClick={() => removeMember(member.user.id)}
                  className="text-xs cursor-pointer px-2 py-1 text-gray-200 hover:text-red-500 transition"
                >
                  <FiTrash size={16} />
                </button>
              )}
              {member.role === "OWNER" ? (
                <span className="ml-auto px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                  Dono
                </span>
              ) : (
                <span className="ml-auto px-2 py-1 text-xs font-medium text-white bg-orange-400 rounded-full">
                  Membro
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lists */}
      <CreateList boardId={boardId} />
      <Lists boardId={boardId} />
    </div>
  );
}
