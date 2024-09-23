import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DashboardSideBar } from "@/components/dashboard/dashboardSideBar";
import { MainPrices } from "@/components/dashboard/MainPrices";
import { DashboardHeader } from "@/components/dashboard/dashboardHeader";

export default function Dashboard() {
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
        <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-4'>
          <Card>
            <CardHeader>
              <CardTitle>
                Today&apos;s Cryptocurrency Prices by Market Cap
              </CardTitle>
              <CardDescription>
                Keep track of any coin movement with favourite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MainPrices />
            </CardContent>
            {/* <CardFooter>
              <div className='text-xs text-muted-foreground'>
                Showing <strong>10</strong> of <strong>10066</strong>
              </div>
            </CardFooter> */}
          </Card>
        </main>
      </div>
    </div>
  );
}
