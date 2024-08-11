import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DashboardSideBar } from "@/components/dashboard/dashboardSideBar";
import { DashboardHeader } from "@/components/dashboard/dashboardHeader";

export default function SecuritySettings() {
  return (
    <div className='flex min-h-screen w-full flex-col bg-muted/40'>
      <aside className='fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex'>
        <DashboardSideBar />
      </aside>
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
        <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
          <div className='relative ml-auto flex-1 md:grow-0'></div>
          <DashboardHeader />
        </header>
        <div className='flex min-h-screen w-full flex-col'>
          <main className='flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10'>
            <div className='mx-auto grid w-full max-w-6xl gap-2'>
              <h1 className='text-3xl font-semibold'>Security Settings</h1>
            </div>
            <div className='mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]'>
              <nav
                className='grid gap-4 text-sm text-muted-foreground'
                x-chunk='dashboard-04-chunk-0'
              >
                <Link href='/dashboard/settings' className='font-semibold'>
                  General
                </Link>
                <Link
                  href='/dashboard/settings/security'
                  className='font-semibold text-primary'
                >
                  Security
                </Link>
              </nav>
              <div className='grid gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your account password.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form>
                      <Input
                        type='password'
                        placeholder='Current Password'
                        className='mb-4'
                      />
                      <Input
                        type='password'
                        placeholder='New Password'
                        className='mb-4'
                      />
                      <Input
                        type='password'
                        placeholder='Confirm New Password'
                      />
                    </form>
                  </CardContent>
                  <CardFooter className='border-t px-6 py-4'>
                    <Button>Update Password</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
