import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function SignUpForm() {
  return (
    <Card className='max-w-sm'>
      <CardContent className='text-xl mt-8'>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='full-name'>Full name</Label>
            <Input id='full-name' placeholder='Robinson Tan' required />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='nus@gmail.com'
              required
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' type='password' />
          </div>
          <Button type='submit' className='w-full'>
            Create an account
          </Button>
          <Button variant='outline' className='w-full'>
            Sign up with Google
          </Button>
        </div>
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
