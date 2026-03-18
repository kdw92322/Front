import React, { useMemo, useState, useEffect } from 'react';
import { flexRender } from '@tanstack/react-table';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/config'
import axios from '../../lib/axios';

export function CodeManagement() {
    const [filter, setFilter] = useState({});

    const columns = useMemo(
        () => [
          { accessorKey: 'name', header: '이름', size:20 },
          { accessorKey: 'email', header: '이메일', size:20 },
          { accessorKey: 'role', header: '역할', size:20 },
          { accessorKey: 'status', header: '상태', size:20 },
          { accessorKey: 'phone', header: '전화번호', size:20 },
        ],
      []
    )
    
    const table = useReactTable({
      data: [],
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    return (
        <main className="h-full overflow-y-auto p-3 scrollbar-hidden">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle>조회 조건</CardTitle>
                  </div>
                  {/* 오른쪽 영역 (버튼 등 추가) */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {}}>
                      초기화
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => search()}>
                      조회
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full grid-cols-4 items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="codeGroup" className="w-20">코드 명</label>
                            <Input id="codeGroup" placeholder="코드 그룹을 입력하세요" value={filter.codeGroup || ''} onChange={(e) => setFilter({ ...filter, codeGroup: e.target.value })} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label htmlFor="codeValue" className="w-20">코드 값</label>
                            <Input id="codeValue" placeholder="코드 값을 입력하세요" value={filter.codeValue || ''} onChange={(e) => setFilter({ ...filter, codeValue: e.target.value })} />
                        </div>
                    </div>
                </CardContent>
              </Card>
                    
              <div className="mt-6 grid h-[calc(100vh-25rem)] grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr]">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>코드 목록</CardTitle>
                    <CardDescription>0건</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                        <div className="max-h-[calc(100vh-30rem)] overflow-y-auto">
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
                    <CardTitle>코드 정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    
                    <div className="mt-6 flex justify-end gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => console.log("저장")}>
                        저장
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-blue-700 text-white" onClick={() => console.log("삭제")}>
                        삭제
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
    )
}
