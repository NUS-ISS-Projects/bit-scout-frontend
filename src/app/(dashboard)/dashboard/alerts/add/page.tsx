"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { DashboardSideBar } from "@/components/dashboard/dashboardSideBar";
import { DashboardHeader } from "@/components/dashboard/dashboardHeader";

export default function AddAlert() {
  const [coin, setCoin] = useState("");
  const [alertType, setAlertType] = useState("");
  const [alertValue, setAlertValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const router = useRouter();

  const handleAddAlert = (e: any) => {
    e.preventDefault();
    router.push("/dashboard/alerts");
  };

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
        <main className='flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col items-center justify-center bg-muted/40 p-4 md:p-10'>
          <div className='w-full max-w-md bg-white rounded-lg shadow-md p-6'>
            <h1 className='text-2xl font-bold mb-6 text-center'>
              Add New Alert
            </h1>
            <form>
              <Input
                placeholder='Coin'
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                className='mb-4'
              />
              <Input
                placeholder='Alert Type'
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className='mb-4'
              />
              <Input
                placeholder='Alert Value'
                value={alertValue}
                onChange={(e) => setAlertValue(e.target.value)}
                className='mb-4'
              />
              <Input
                placeholder='Remarks'
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className='mb-4'
              />
              <Button onClick={handleAddAlert}>Add Alert</Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
