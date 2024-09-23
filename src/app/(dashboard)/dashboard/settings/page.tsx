"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { DashboardSideBar } from "@/components/dashboard/dashboardSideBar";
import { DashboardHeader } from "@/components/dashboard/dashboardHeader";

const ACCOUNT_API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Settings() {
  const [userData, setUserData] = useState({
    uid: "",
    name: "",
    avatar: "",
    introduction: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        setLoading(true);
        const response = await axios.get(`${ACCOUNT_API}/account/user?token=${token}`);

        setUserData(() => ({
          uid: response.data.uid,
          name: response.data.name,
          avatar: response.data.avatar,
          introduction: response.data.introduction,
        }));
      } catch (err) {
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e: any) => {
    setUserData({
      ...userData,
      [e.target.id]: e.target.value,
    });
  };

  const handleAvatarChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({
          ...userData,
          avatar: reader.result as string,
        });
      };
      reader.readAsDataURL(file); // Convert image to base64 string
    }
  };

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`${ACCOUNT_API}/account/${userData.uid}/updateUserDetails`, {
        name: userData.name,
        introduction: userData.introduction,
        avatar: userData.avatar,
      });
      setError(null);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
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
        <div className='flex min-h-screen w-full flex-col'>
          <main className='flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10'>
            <div className='mx-auto grid w-full max-w-6xl gap-2'>
              <h1 className='text-3xl font-semibold'>Settings</h1>
            </div>
            <div className='mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]'>
              <nav className='grid gap-4 text-sm text-muted-foreground'>
                <Link
                  href='/dashboard/settings'
                  className='font-semibold text-primary'
                >
                  General
                </Link>
                <Link href='/dashboard/settings/security'>Security</Link>
              </nav>
              <div className='grid gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                    <CardDescription>
                      Please upload a new avatar image.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleFormSubmit}>
                    <div className='flex items-center space-x-4'>
                      <CardContent className='flex items-center space-x-4'>
                        <Avatar>
                          <AvatarImage src={userData.avatar || "/avatar.png"} />
                          <AvatarFallback>
                            {userData.name?.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <Input
                          type='file'
                          id='avatar'
                          accept='image/*'
                          className='mt-1'
                          onChange={handleAvatarChange}
                        />
                      </CardContent>
                    </div>
                    <CardHeader>
                      <CardTitle>Name</CardTitle>
                      <CardDescription>Please enter a nickname</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Input
                        id='name'
                        placeholder='Full Name'
                        value={userData.name}
                        onChange={handleInputChange}
                      />
                    </CardContent>
                    <div>
                      <CardHeader>
                        <CardTitle>Introduction</CardTitle>
                        <CardDescription>
                          Please enter your personal introduction
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Input
                          id='introduction'
                          placeholder='Introduction'
                          value={userData.introduction || ""}
                          onChange={handleInputChange}
                        />
                      </CardContent>
                    </div>
                    <CardFooter className='border-t px-6 py-4'>
                      {error && (
                        <Alert variant='destructive'>
                          <Icons.circleAlert className='h-4 w-4' />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <Button type='submit' disabled={loading} className='mt-3'>
                        {loading ? "Saving..." : "Save"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
