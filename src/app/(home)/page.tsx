import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import logo from "../../../public/homeChart.png";

export default function Home() {
  return (
    <div className='flex flex-col items-center justify-center h-full w-full'>
      <div className='flex flex-row items-center justify-center space-y-12 space-x-20'>
        <div className='p-10 m-20'>
          <Image src={logo} alt='Logo' width={500} height={500} />
        </div>
        <div className='flex flex-col max-w-lg'>
          <h1 className='text-4xl font-bold'>Stay Ahead of the Market:</h1>
          <h2 className='text-2xl font-medium mt-2'>
            Real-Time Cryptocurrency Price Monitoring
          </h2>
          <Button
            asChild
            className='mt-10 bg-gradient-to-r from-purple-400 to-pink-500 px-6 py-3 text-white text-xl rounded-full'
          >
            <Link href='/login'>Log in to Start</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
