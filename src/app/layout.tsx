import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from "@/contexts/NotificationContext";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: "/favicon-32x32.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <NotificationProvider>
        <html lang='en'>
          <body className={inter.className}>
            {children} <Toaster />{" "}
          </body>
        </html>
      </NotificationProvider>
    </ToastProvider>
  );
}
