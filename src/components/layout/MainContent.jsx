import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function MainContent() {
  return (
    <main className="h-full overflow-y-auto p-6 scrollbar-hidden">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>1,268</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,268</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>512</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">512</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Signups</CardTitle>
            <CardDescription>38 this week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">38</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bug Reports</CardTitle>
            <CardDescription>2 unresolved</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events in your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="rounded-md bg-slate-50 p-3">New user registered: johndoe@example.com</li>
            <li className="rounded-md bg-slate-50 p-3">Session timeout issue fixed</li>
            <li className="rounded-md bg-slate-50 p-3">Database backup completed</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
