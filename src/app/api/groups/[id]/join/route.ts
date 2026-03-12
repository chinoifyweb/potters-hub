import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const group = await prisma.group.findUnique({ where: { id: params.id } })
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: "Already a member of this group" },
        { status: 409 }
      )
    }

    const membership = await prisma.groupMember.create({
      data: {
        groupId: params.id,
        userId: session.user.id,
        role: "member",
      },
    })

    return NextResponse.json(membership, { status: 201 })
  } catch (error) {
    console.error("Error joining group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this group" },
        { status: 404 }
      )
    }

    await prisma.groupMember.delete({
      where: { id: membership.id },
    })

    return NextResponse.json({ message: "Left group successfully" })
  } catch (error) {
    console.error("Error leaving group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
