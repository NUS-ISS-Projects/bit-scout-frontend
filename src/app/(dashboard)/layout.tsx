"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.push("/login");
    }
  }, [router]);
  return (
    <TooltipProvider>
      <div className='min-h-screen'>{children}</div>
    </TooltipProvider>
  );
}
