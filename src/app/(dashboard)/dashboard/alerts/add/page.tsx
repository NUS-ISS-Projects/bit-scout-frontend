"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon } from "lucide-react";

import { DashboardSideBar } from "@/components/dashboard/dashboardSideBar";
import { DashboardHeader } from "@/components/dashboard/dashboardHeader";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

const selectedCoins = [
  "btcusdt", // #1 Bitcoin
  "ethusdt", // #2 Ethereum
  "bnbusdt", // #3 BNB
  "solusdt", // #4 Solana
  "usdcusdt", // #5 USD Coin
  "xrpusdt", // #6 XRP
  "dogeusdt", // #7 Dogecoin
  "tonusdt", // #8 Toncoin
  "trxusdt", // #9 Tron
  "adausdt", // #10 Cardano
];

const tokenNameMap: Record<string, string> = {
  BTCUSDT: "Bitcoin",
  ETHUSDT: "Ethereum",
  BNBUSDT: "Binance Coin",
  SOLUSDT: "Solana",
  USDCUSDT: "USD Coin",
  XRPUSDT: "Ripple",
  DOGEUSDT: "Dogecoin",
  TONUSDT: "Toncoin",
  TRXUSDT: "Tron",
  ADAUSDT: "Cardano",
};

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

  const handleBackToAlert = () => {
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
            <Button
              variant='outline'
              size='icon'
              className='mb-6'
              onClick={handleBackToAlert}
            >
              <ChevronLeftIcon className='h-4 w-4' />
            </Button>
            <form>
              <Select>
                <SelectTrigger className='mb-4'>
                  <SelectValue placeholder='Select a Coin' />
                </SelectTrigger>
                <SelectContent>
                  {selectedCoins.map((coin) => {
                    const tokenSymbol = coin.replace("usdt", "").toUpperCase();
                    const imageName = tokenSymbol.toLowerCase();
                    const imageSrc = `/coins/${imageName}.png`;

                    return (
                      <SelectItem key={coin} value={coin}>
                        <div className='flex items-center'>
                          <Image
                            src={imageSrc}
                            width={24}
                            height={24}
                            alt={`${tokenNameMap[tokenSymbol + "USDT"]} logo`}
                            className='mr-2'
                          />
                          {tokenNameMap[tokenSymbol + "USDT"]}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className='mb-4'>
                  <SelectValue placeholder='Alert Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='price rise to'>
                    <div className='flex items-center'>
                      <ChevronUpIcon className='h-4 w-4 mr-2 text-green-600' />
                      Price increase to
                    </div>
                  </SelectItem>
                  <SelectItem value='price fall to'>
                    <div className='flex items-center'>
                      <ChevronDownIcon className='h-4 w-4 mr-2 text-red-600' />
                      Price decrease to
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
