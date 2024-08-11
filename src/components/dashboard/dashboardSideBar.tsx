"use client";
import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Home, Bell, BellDot, Star } from "lucide-react";
import Link from "next/link";

export function DashboardSideBar() {
  const [notications, setNotications] = useState(1);
  return (
    <>
      <nav className='flex flex-col items-center gap-4 px-2 py-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href='/dashboard'
              className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'
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
              className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'
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
              className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'
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
