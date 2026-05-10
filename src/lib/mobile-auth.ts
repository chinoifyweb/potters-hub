import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export interface MobileUser {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
}

export async function getMobileUser(req: NextRequest): Promise<MobileUser | null> {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return null;
    const token = auth.slice(7);
    const secret = process.env.NEXTAUTH_SECRET || "fallback-dev-secret";
    const payload: any = jwt.verify(token, secret);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, fullName: true, isActive: true },
    });
    if (!user || !user.isActive) return null;
    return { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
  } catch {
    return null;
  }
}
