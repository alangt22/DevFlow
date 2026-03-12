import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"];
    boardId?: string;
    membership?: string;
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: null | string | boolean;
  image?: string;
  phone?: string;
  membership?: string;
  createdAt: string;
  updatedAt: string;
}
