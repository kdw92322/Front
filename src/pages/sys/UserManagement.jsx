import React, { useMemo, useState, useEffect } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/config';
import { getCodeDetails } from '../../lib/code';
import GridTable from '@/components/layout/GridTable';
import axios from '../../lib/axios';

export function UserManagement() {
  const [users, setUsers] = useState([
    // { id: 1, name: '홍길동', email: 'hong@example.com', role: 'Admin', status: 'Active', phone: '010-1234-5678' },
    // { id: 2, name: '김영희', email: 'kim@example.com', role: 'User', status: 'Inactive', phone: '010-9876-5432' },
    // { id: 3, name: '박철수', email: 'park@example.com', role: 'Manager', status: 'Active', phone: '010-2222-3333' },
    // { id: 4, name: '이민수', email: 'lee@example.com', role: 'User', status: 'Active', phone: '010-4444-5555' },
    // { id: 5, name: '최수진', email: 'choi@example.com', role: 'Admin', status: 'Inactive', phone: '010-6666-7777' },
  ]);

  const [combeRoles, setComboRoles] = useState([]);
  const [combeStatus, setComboStatus] = useState([]);

  const [filter, setFilter] = useState({ query: '', role: 'All', status: 'All' });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(selected);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    //코드 정보 불러오기
    const fetchCodeData = async () => {
      try {
        const roleData = await getCodeDetails('role');
        setComboRoles(roleData);

        const statData = await getCodeDetails('stat');
        setComboStatus(statData);
      } catch (e) {
        console.error('Failed to fetch code groups:', e);
      }
    };
    fetchCodeData();
  }, [])

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
      { accessorKey: 'name', header: '이름', size:20 },
      { accessorKey: 'email', header: '이메일', size:20 },
      { accessorKey: 'role', header: '역할', size:20 },
      { accessorKey: 'status', header: '상태', size:20 },
      { accessorKey: 'phone', header: '전화번호', size:20},
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

  const searchCondInit = () => {
    setFilter({ query: '', role: 'All', status: 'All' })
  } 

  const search = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/select`, { params: filter })
        setUsers(response.data);
        //return response.data;
    } catch (error) {
      console.error('검색 중 오류:', error)
      //return [];
    }
  }

  const handleRowClick = (rowData) => {
    console.log("클릭된 데이터:", rowData);
    setSelectedId(rowData.id); // 선택된 ID 저장 (하이라이트용)
    setEditing({ ...rowData });
  };

  const onDelete = () => {  
    
  }

  return (
    <main className="h-full overflow-y-auto p-3 scrollbar-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <CardTitle>사용자 관리</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => searchCondInit()}>
            초기화
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNewForm()}>
            신규
          </Button>
          <Button variant="outline" size="sm" onClick={() => search()}>
            조회
          </Button>
          <Button variant="outline" size="sm" onClick={() => onSave()}>
            저장
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete()}>
            삭제
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold">조회조건</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">검색</label>
              <Input
                value={filter.query}
                placeholder="이름 또는 이메일"
                onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">권한</label>
              <select
                value={filter.role}
                onChange={(e) => setFilter((prev) => ({ ...prev, role: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
              >
                <option value="All">All</option>
                {combeRoles.map((role) => (
                  <option key={role.dtl_cd} value={role.dtl_cd}>{role.dtl_nm}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">상태</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
              >
                <option value="All">All</option>
                {combeStatus.map((status) => (
                  <option key={status.dtl_cd} value={status.dtl_cd}>{status.dtl_nm}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid h-[calc(100vh-25rem)] grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">사용자 목록</CardTitle>
            <CardDescription>{filteredUsers.length}건</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <GridTable columns={columns} data={users} isLoading={loading} onRowClick={handleRowClick} selectedRowId={selectedId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">사용자 정보</CardTitle>
            {/* <CardDescription>그리드에서 행을 클릭하면 이곳에 상세 정보가 표시됩니다.</CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all">
              {/* 헤더 영역 */}
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h3 className="text-base font-semibold text-slate-800">상세 정보 편집</h3>
              </div>

              <div className="p-6">
                {!editing ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-500">목록에서 사용자를 선택해주세요.</p>
                  </div>
                ) : (
                  <div className="grid gap-x-6 gap-y-5 lg:grid-cols-2">
                    {/* 이름 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">이름</label>
                      <Input
                        className="h-10 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
                        value={editing.name || ''}
                        onChange={(e) => onInputChange('name', e.target.value)}
                        placeholder="이름을 입력하세요"
                      />
                    </div>

                    {/* 이메일 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">이메일</label>
                      <Input
                        type="email"
                        className="h-10 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
                        value={editing.email || ''}
                        onChange={(e) => onInputChange('email', e.target.value)}
                        placeholder="example@mail.com"
                      />
                    </div>

                    {/* 역할 (Select) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">역할</label>
                      <select
                        value={editing.role || ''}
                        onChange={(e) => onInputChange('role', e.target.value)}
                        className="block h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                      >
                        {combeRoles.map((role) => (
                          <option key={role.dtl_cd} value={role.dtl_cd}>{role.dtl_nm}</option>
                        ))}
                      </select>
                    </div>

                    {/* 상태 (Select) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">상태</label>
                      <select
                        value={editing.status || ''}
                        onChange={(e) => onInputChange('status', e.target.value)}
                        className="block h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                      >
                        {combeStatus.map((status) => (
                          <option key={status.dtl_cd} value={status.dtl_cd}>{status.dtl_nm}</option>
                        ))}
                      </select>
                    </div>

                    {/* 전화번호 (전체 너비) */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">전화번호</label>
                      <Input
                        className="h-10 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
                        value={editing.phone || ''}
                        onChange={(e) => onInputChange('phone', e.target.value)}
                        placeholder="010-0000-0000"
                      />
                    </div>

                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
