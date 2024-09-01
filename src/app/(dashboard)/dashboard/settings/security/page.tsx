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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { DashboardSideBar } from "@/components/dashboard/dashboardSideBar";
import { DashboardHeader } from "@/components/dashboard/dashboardHeader";

const ACCOUNT_API = process.env.NEXT_PUBLIC_ACCOUNT_API;

export default function SecuritySettings() {
  const [userData, setUserData] = useState({
    uid: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
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
        const response = await axios.get(`${ACCOUNT_API}/user?token=${token}`);

        setUserData((prevState) => ({
          ...prevState,
          uid: response.data.uid,
          email: response.data.email,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Check if new password and confirm new password match
    if (userData.newPassword !== userData.confirmNewPassword) {
      setError("New password and confirm new password do not match.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      await axios.put(
        `${ACCOUNT_API}/${userData.uid}/updateUserEmailPassword`,
        {
          newEmail: userData.email,
          newPassword: userData.newPassword,
          oldPassword: userData.currentPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Profile updated successfully!");
    } catch (err) {
      setError(
        "Incorrect current password. Please check your current password."
      );
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
                    <CardTitle>Email</CardTitle>
                    <CardDescription>
                      Please enter a valid email
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    <CardContent>
                      <Input
                        id='email'
                        placeholder='Email'
                        value={userData.email}
                        onChange={handleInputChange}
                      />
                    </CardContent>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your account password.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Input
                        id='currentPassword'
                        type='password'
                        placeholder='Current Password'
                        onChange={handleInputChange}
                        className='mb-4'
                      />
                      <Input
                        id='newPassword'
                        type='password'
                        placeholder='New Password'
                        onChange={handleInputChange}
                        className='mb-4'
                      />
                      <Input
                        id='confirmNewPassword'
                        type='password'
                        placeholder='Confirm New Password'
                        onChange={handleInputChange}
                      />
                    </CardContent>
                    <CardFooter className='border-t px-6 py-4'>
                      <div className='flex-row'>
                        {error && (
                          <Alert variant='destructive'>
                            <Icons.circleAlert className='h-4 w-4' />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <Button
                          type='submit'
                          disabled={loading}
                          className='mt-3'
                        >
                          {loading ? "Updating..." : "Update"}
                        </Button>
                      </div>
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
