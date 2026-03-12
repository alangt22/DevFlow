import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)

  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json([])
  }

  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: email,
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  })

  return NextResponse.json(users)
}