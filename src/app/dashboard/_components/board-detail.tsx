"use client";

import useSWR, { mutate } from "swr";
import axios from "axios";
import { Lists } from "./list";
import { CreateList } from "./create-list";
import { FiGrid, FiSearch, FiTrash, FiUser } from "react-icons/fi";
import { useState, useEffect, useRef, useCallback } from "react";
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
  const routerRef = useRef(router);
  const [isRemoved, setIsRemoved] = useState(false);
  const isRemovedRef = useRef(false);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    isRemovedRef.current = isRemoved;
  }, [isRemoved]);

  const checkAndHandleRemoval = useCallback(() => {
    if (isRemovedRef.current) return;
    isRemovedRef.current = true;
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
      routerRef.current.push("/dashboard");
    }, 3000);
  }, []);

  const { data: board, isLoading } = useSWR<Board>(
    boardId ? `/api/boards/${boardId}` : null,
    fetcher,
    {
      onSuccess: (data) => {
        if (!isRemovedRef.current) {
          const normalizedUserEmail = userEmail.toLowerCase();
          const isStillMember = data.members.some(
            (member: BoardMember) =>
              member.user.email?.toLowerCase() === normalizedUserEmail,
          );
          if (!isStillMember) {
            checkAndHandleRemoval();
          }
        }
      },
      onError: () => {
        if (!isRemovedRef.current) {
          checkAndHandleRemoval();
        }
      },
    },
  );

  useEffect(() => {
    const channel = pusherClient.subscribe(`board-${boardId}`);

    channel.bind("member-removed", (data: { removedUserEmail: string }) => {
      console.log("Pusher event received:", data);
      const normalizedUserEmail = userEmail.toLowerCase().trim();
      const normalizedRemovedEmail = data.removedUserEmail
        ?.toLowerCase()
        .trim();
      if (normalizedRemovedEmail === normalizedUserEmail) {
        checkAndHandleRemoval();
      }
    });

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Pusher subscribed to board-" + boardId);
    });

    channel.bind("pusher:error", (err: { error: { message: string } }) => {
      console.error("Pusher error:", err);
    });

    return () => {
      pusherClient.unsubscribe(`board-${boardId}`);
    };
  }, [boardId, userEmail, checkAndHandleRemoval]);

  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

  function openRemoveModal(userId: string, userName: string) {
    setMemberToRemove({ id: userId, name: userName });
  }

  async function confirmRemoveMember() {
    if (!memberToRemove) return;

    setLoading(true);

    try {
      await axios.delete(`/api/boards/${boardId}/share`, {
        data: { userId: memberToRemove.id },
      });
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
      setMemberToRemove(null);
      mutate(`/api/boards/${boardId}`);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
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
          <p className="text-gray-500 mt-2">
            Redirecionando para o Dashboard...
          </p>
        </div>
      </div>
    );
  }

  function toggleModal() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="p-4 min-h-screen bg-blue-400/50 rounded">
      {/* Título da Board */}
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-400 rounded">
            <FiGrid size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold capitalize text-white">
            {board?.title}
          </h1>
        </div>
        <div className="flex items-center">
          <button
            className="flex items-center p-1 gap-2 cursor-pointer bg-blue-400 rounded-md text-gray-200 hover:bg-blue-600 transition"
            onClick={toggleModal}
          >
            <FiUser size={24} className="text-gray-200" />
            {isOpen ? "Fechar" : "Membros"}
          </button>
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
              className="p-2 bg-blue-400 cursor-pointer rounded-md text-white hover:bg-blue-600 transition"
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
      {isOpen && (
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
                <span className="text-sm text-gray-500">
                  {member.user.email}
                </span>
              </div>

              {/* Badge role */}
              <div className="ml-auto flex flex-col items-end gap-1">
                {member.role === "MEMBER" && isOwner && (
                  <button
                    onClick={() =>
                      openRemoveModal(
                        member.user.id,
                        member.user.name || member.user.email,
                      )
                    }
                    className="text-xs cursor-pointer px-2 py-1 text-gray-200 hover:text-red-500 transition"
                  >
                    <FiTrash size={20} />
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
      )}

      {/* Lists */}
      <CreateList boardId={boardId} />
      <Lists boardId={boardId} />

      {/* Modal de remoção de membro */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-100 mb-2">
              Remover membro
            </h3>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja remover{" "}
              <strong>{memberToRemove.name}</strong> desta board?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 transition"
              >
                {loading ? "Cancelando..." : "Cancelar"}
              </button>
              <button
                onClick={confirmRemoveMember}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                {loading ? "Removendo..." : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
