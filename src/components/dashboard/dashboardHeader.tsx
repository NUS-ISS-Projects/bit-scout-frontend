import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='overflow-hidden rounded-full'
        >
          <Image
            src='/avatar.png'
            width={36}
            height={36}
            alt='Avatar'
            className='overflow-hidden rounded-full'
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <Link href='/settings' passHref>
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
