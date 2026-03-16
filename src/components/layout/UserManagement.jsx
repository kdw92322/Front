import React, { useMemo, useState, useEffect } from 'react'
import { flexRender } from '@tanstack/react-table';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const initialUsers = [
  { id: 1, name: '홍길동', email: 'hong@example.com', role: 'Admin', status: 'Active', phone: '010-1234-5678' },
  { id: 2, name: '김영희', email: 'kim@example.com', role: 'User', status: 'Inactive', phone: '010-9876-5432' },
  { id: 3, name: '박철수', email: 'park@example.com', role: 'Manager', status: 'Active', phone: '010-2222-3333' },
  { id: 4, name: '이민수', email: 'lee@example.com', role: 'User', status: 'Active', phone: '010-4444-5555' },
  { id: 5, name: '최수진', email: 'choi@example.com', role: 'Admin', status: 'Inactive', phone: '010-6666-7777' },
]

export function UserManagement() {
  const [users, setUsers] = useState(initialUsers)
  const [filter, setFilter] = useState({ query: '', role: 'All', status: 'All' })
  const [selected, setSelected] = useState(initialUsers[0])
  const [editing, setEditing] = useState(selected)

  useEffect(() => {
    setEditing(selected)
  }, [selected])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = filter.query.trim().toLowerCase()
      const matchQuery =
        !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
      const matchRole = filter.role === 'All' || user.role === filter.role
      const matchStatus = filter.status === 'All' || user.status === filter.status
      return matchQuery && matchRole && matchStatus
    })
  }, [users, filter])

  const columns = useMemo(
    () => [
      { accessorKey: 'name', header: '이름' },
      { accessorKey: 'email', header: '이메일' },
      { accessorKey: 'role', header: '역할' },
      { accessorKey: 'status', header: '상태' },
      { accessorKey: 'phone', header: '전화번호' },
    ],
    []
  )

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const onInputChange = (key, value) => {
    setEditing((prev) => ({ ...prev, [key]: value }))
  }

  const onSave = () => {
    if (!editing?.id) return
    setUsers((prev) => prev.map((u) => (u.id === editing.id ? editing : u)))
    setSelected(editing)
  }

  return (
    <main className="h-full overflow-y-auto p-6 scrollbar-hidden">
      <Card>
        <CardHeader>
          <CardTitle>사용자 조회조건</CardTitle>
          <CardDescription>검색 및 필터를 통해 사용자 목록을 추출합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">검색</label>
              <Input
                value={filter.query}
                placeholder="이름 또는 이메일"
                onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">역할</label>
              <select
                value={filter.role}
                onChange={(e) => setFilter((prev) => ({ ...prev, role: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>All</option>
                <option>Admin</option>
                <option>Manager</option>
                <option>User</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">상태</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid h-[calc(100vh-20rem)] grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
            <CardDescription>{filteredUsers.length}건</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[calc(100vh-22rem)] overflow-y-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-3 py-2 font-semibold">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => {
                    const user = row.original
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelected(user)}
                        className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${
                          selected?.id === user.id ? 'bg-slate-100 font-semibold' : ''
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-3 py-2 align-middle">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>선택된 사용자 정보</CardTitle>
            <CardDescription>그리드에서 행을 클릭하면 이곳에 상세 정보가 표시됩니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {!editing ? (
              <p className="text-sm text-slate-500">사용자를 선택해주세요.</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">이름</label>
                  <Input
                    value={editing.name}
                    onChange={(e) => onInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
                  <Input
                    type="email"
                    value={editing.email}
                    onChange={(e) => onInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">역할</label>
                  <select
                    value={editing.role}
                    onChange={(e) => onInputChange('role', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Admin</option>
                    <option>Manager</option>
                    <option>User</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">상태</label>
                  <select
                    value={editing.status}
                    onChange={(e) => onInputChange('status', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">전화번호</label>
                  <Input
                    value={editing.phone}
                    onChange={(e) => onInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(selected)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
