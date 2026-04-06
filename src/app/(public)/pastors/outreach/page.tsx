"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import OutreachPanel from "@/components/outreach-panel";
import { Loader2 } from "lucide-react";

export default function PastorOutreachPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login?callbackUrl=/pastors/outreach");
      return;
    }
    if (session.user?.role !== "pastor" && session.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (session.user?.role !== "pastor" && session.user?.role !== "admin") {
    return null;
  }

  return <OutreachPanel />;
}
