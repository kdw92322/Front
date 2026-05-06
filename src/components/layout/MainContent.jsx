import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 가상의 오늘의 접속자 데이터
const loginData = [
  { time: '09:00', count: 120 },
  { time: '11:00', count: 280 },
  { time: '13:00', count: 150 },
  { time: '15:00', count: 420 },
  { time: '17:00', count: 310 },
  { time: '19:00', count: 180 },
];

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

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        {/* 최근 활동 목록 */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events in your workspace</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2">
              <li className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">New user registered: johndoe@example.com</li>
              <li className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">Session timeout issue fixed</li>
              <li className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">Database backup completed</li>
            </ul>
          </CardContent>
        </Card>

        {/* 오늘의 접속 현황 그래프 */}
        <Card>
          <CardHeader>
            <CardTitle>오늘의 접속 현황</CardTitle>
            <CardDescription>시간대별 접속자 추이 (오늘 기준)</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loginData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
