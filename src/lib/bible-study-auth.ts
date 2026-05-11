import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileUser } from "@/lib/mobile-auth";

export interface BibleStudyUser {
  id: string;
  role: string;
  fullName: string | null;
}

export async function getCurrentUser(req: NextRequest): Promise<BibleStudyUser | null> {
  const mobile = await getMobileUser(req);
  if (mobile) {
    return { id: mobile.id, role: mobile.role, fullName: mobile.fullName };
  }
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const id = (session.user as any).id as string;
    const role = (session.user as any).role as string;
    return { id, role, fullName: session.user.name ?? null };
  }
  return null;
}

export function isAdmin(user: BibleStudyUser | null): boolean {
  return !!user && (user.role === "admin" || user.role === "pastor");
}
