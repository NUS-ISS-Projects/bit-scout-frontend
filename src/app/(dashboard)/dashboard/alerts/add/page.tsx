"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddAlert() {
  const [coin, setCoin] = useState("");
  const [alertType, setAlertType] = useState("");
  const [alertValue, setAlertValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const router = useRouter();

  const handleAddAlert = () => {
    console.log({ coin, alertType, alertValue, remarks });
    router.push("/dashboard");
  };

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Add New Alert</h1>
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
  );
}
