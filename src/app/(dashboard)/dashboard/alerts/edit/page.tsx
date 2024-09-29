"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import axios from "axios";

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

const NOTIFICATION_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications`;
const USER_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/account/userId`;

export default function EditAlert() {
  const [coin, setCoin] = useState("");
  const [alertType, setAlertType] = useState("");
  const [alertValue, setAlertValue] = useState("0.00");
  const [remarks, setRemarks] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");

  const handleUpdateAlert = async (e: any) => {
    e.preventDefault();
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    };

    const userIdResponse = await axios.get(`${USER_API}?token=${authToken}`);
    const userId = userIdResponse.data;

    const data = {
      userId: userId,
      token: coin,
      notificationType: alertType,
      notificationValue: parseFloat(alertValue),
      remarks: remarks,
    };

    try {
      await axios.post(`${NOTIFICATION_API}/add`, data, config);
      router.push("/dashboard/alerts");
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleBackToAlert = () => {
    router.push("/dashboard/alerts");
  };

  const fetchAlerts = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
      return;
    }

    try {
      const response = await axios.get(`${NOTIFICATION_API}/getUserList`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const userIdResponse = await axios.get(`${USER_API}?token=${authToken}`);
      const userId = userIdResponse.data;

      const filteredAlerts = response.data.filter(
        (alert: any) =>
          alert.userId === userId && alert.token.toLowerCase() === tokenParam
      );

      if (filteredAlerts.length > 0) {
        const alert = filteredAlerts[0];

        setCoin(alert.token);
        setAlertType(alert.notificationType);
        setAlertValue(alert.notificationValue.toString());
        setRemarks(alert.remarks);
      } else {
        console.log("No alerts found for this user.");
      }
    } catch (error: any) {
      console.error(
        "Error fetching alerts:",
        error.response?.data || error.message || error
      );
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

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
              <Select value={coin} onValueChange={(value) => setCoin(value)}>
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
              <Select
                value={alertType}
                onValueChange={(value) => setAlertType(value)}
              >
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
                value={`$${alertValue}`}
                onChange={(e) => {
                  let { value } = e.target;
                  value = value.replace(/[^0-9.]/g, "");

                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    setAlertValue(value ? value : "0.00");
                  }
                }}
                onBlur={() => {
                  let numericValue = alertValue;

                  if (numericValue && !numericValue.includes(".")) {
                    setAlertValue(`${numericValue}.00`);
                  } else if (
                    numericValue &&
                    numericValue.split(".")[1]?.length === 1
                  ) {
                    setAlertValue(`${numericValue}0`);
                  } else if (!numericValue) {
                    setAlertValue("0.00");
                  }
                }}
                className='mb-4'
              />
              <Input
                placeholder='Remarks'
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className='mb-4'
              />
              <Button onClick={handleUpdateAlert}>Update Alert</Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
