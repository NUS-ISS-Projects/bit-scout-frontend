"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Home, Bell, BellDot, Star } from "lucide-react";
import Link from "next/link";

export function DashboardSideBar() {
  const [notications, setNotications] = useState(1);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  return (
    <>
      <nav className='flex flex-col items-center gap-4 px-2 py-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href='/dashboard'
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                isActive("/dashboard")
                  ? "text-black-500 border-b-2 border-red-500"
                  : "text-muted-foreground"
              }`}
            >
              <Home className='h-5 w-5' />
              <span className='sr-only'>Dashboard</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='right'>Dashboard</TooltipContent>
        </Tooltip>
      </nav>
      <nav className='flex flex-col items-center gap-4 px-2 py-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href='/dashboard/watchlist'
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                isActive("/dashboard/watchlist")
                  ? "text-black-500 border-b-2 border-red-500"
                  : "text-muted-foreground"
              }`}
            >
              <Star className='h-5 w-5' />
              <span className='sr-only'>Watchlists</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='right'>Watchlists</TooltipContent>
        </Tooltip>
      </nav>
      <nav className='flex flex-col items-center gap-4 px-2 py-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href='/dashboard/alerts'
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                isActive("/dashboard/alerts")
                  ? "text-blue-500 border-b-2 border-red-500"
                  : "text-muted-foreground"
              }`}
            >
              {notications > 0 ? (
                <BellDot className='h-5 w-5 text-red-500' />
              ) : (
                <Bell className='h-5 w-5' />
              )}
              <span className='sr-only'>Alerts</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='right'>Alerts</TooltipContent>
        </Tooltip>
      </nav>
    </>
  );
}
