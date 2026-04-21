import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    // TODO: Replace with real API call
    alert('If that email is registered, you will receive reset instructions.')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Enter your email to get password reset instructions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            <a href="/login" className="text-indigo-600 hover:underline">
              Back to Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
