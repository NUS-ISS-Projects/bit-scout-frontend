"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const ACCOUNT_API = process.env.NEXT_PUBLIC_API_BASE_URL;

export function DashboardHeader() {
  const [avatar, setAvatar] = useState("");
  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        // Redirect to login if no token
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get(`${ACCOUNT_API}/account/user?token=${token}`);
        setAvatar(response.data.avatar || "/avatar.png");
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, [router]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='overflow-hidden rounded-full'
        >
          {avatar ? (
            <Image
              src={avatar} // Base64 encoded string as the src
              width={36}
              height={36}
              alt='Avatar'
              className='overflow-hidden rounded-full'
            />
          ) : (
            <div className='w-9 h-9 bg-gray-200 rounded-full'></div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <Link href='/dashboard/settings' passHref>
          <DropdownMenuItem asChild>
            <a>Settings</a>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href='/' passHref>
          <DropdownMenuItem asChild>
            <a>Logout</a>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
