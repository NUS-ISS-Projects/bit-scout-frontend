"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ACCOUNT_API = process.env.NEXT_PUBLIC_ACCOUNT_API;

export function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(`${ACCOUNT_API}/register`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        console.log("Account created successfully");
        window.location.href = "/login";
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  };

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <Card className='max-w-sm'>
      <CardContent className='text-xl mt-8'>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='full-name'>Full name</Label>
              <Input
                id='full-name'
                placeholder='Robinson Tan'
                onChange={handleChange}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='nus@gmail.com'
                onChange={handleChange}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' onChange={handleChange} />
            </div>
            {error && <div className='text-red-600 text-sm mt-2'>{error}</div>}
            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? "Creating account..." : "Create an account"}
            </Button>
          </div>
        </form>
        <div className='mt-4 text-center text-sm'>
          Already have an account?{" "}
          <Link href='/login' className='underline'>
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
