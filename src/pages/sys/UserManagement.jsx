import React, { useMemo, useState, useEffect } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/config';
import { getCodeDetails } from '../../lib/code';
import GridTable from '@/components/layout/GridTable';
import axios from '../../lib/axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [combeRoles, setComboRoles] = useState([]);
  const [combeStatus, setComboStatus] = useState([]);

  const [filter, setFilter] = useState({ query: '', role: '', status: '' });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(selected);
  const [selectedId, setSelectedId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      search();
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
      { accessorKey: 'id', header: '아이디', size:50 },
      { accessorKey: 'name', header: '이름', size:50 },
      /*
      { accessorKey: 'email', header: '이메일', size:20 },
      { accessorKey: 'role', header: '역할', size:20 },
      { accessorKey: 'status', header: '상태', size:20 },
      { accessorKey: 'phone', header: '전화번호', size:20},
      */
    ],
    []
  )
  
  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const onInputChange = (key, value) => {
    let finalValue = value;
    if (key === 'phone') {
      const rawValue = value.replace(/[^0-9]/g, '');
      let formattedValue = '';
      if (rawValue.length > 0) {
        formattedValue = rawValue.substring(0, 3);
      }
      if (rawValue.length > 3) {
        formattedValue += '-' + rawValue.substring(3, 7);
      }
      if (rawValue.length > 7) {
        formattedValue += '-' + rawValue.substring(7, 11);
      }
      finalValue = formattedValue;
    }
    setEditing((prev) => ({ ...prev, [key]: finalValue }))
  }

  const onNewForm = () => {
    setEditing({});
    setSelectedId(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  const onSave = async () => {
    if (!editing.id) {
      alert("아이디는 필수 입력 항목입니다.");
      return;
    }
    if (!editing.name || !editing.email) {
      alert("이름과 이메일은 필수 입력 항목입니다.");
      return;
    }

    // 신규 등록이거나 비밀번호를 입력했을 경우 검증
    if (!selectedId && !editing.password) {
      alert("신규 등록 시 비밀번호는 필수입니다.");
      return;
    }
    if (editing.password && editing.password !== editing.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    //비밀번호 확인은 제거
    setEditing(({ passwordConfirm, ...rest }) => rest);

    try {
      // selectedId가 존재하면 수정(Update), 없으면 신규(Insert)로 처리
      if (selectedId) {
        await axios.put(`${API_BASE_URL}/user/update`, editing);
      } else {
        await axios.post(`${API_BASE_URL}/user/insert`, editing);
      }
      alert('저장되었습니다.');
      search();
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('저장에 실패했습니다.');
    }
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
    setSelectedId(rowData.id); 
    setEditing({ ...rowData });
  };

  const onDelete = async () => {
    if (!selectedId) {
      alert('삭제할 사용자를 선택해주세요.');
      return;
    }
    if (window.confirm('선택한 사용자를 삭제하시겠습니까?')) {
      try {
        await axios.post(`${API_BASE_URL}/user/delete`, { id: selectedId });
        alert('삭제되었습니다.');
        search();
        onNewForm();
      } catch (error) {
        console.error('삭제 중 오류:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  }

  return (
    <main className="h-full overflow-y-auto p-3 scrollbar-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <CardTitle className="text-lg">사용자 관리</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => searchCondInit()}>
            초기화
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => onNewForm()}>
            신규
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => search()}>
            조회
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => onSave()}>
            저장
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => onDelete()}>
            삭제
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-sm font-semibold">조회조건</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">검색</label>
              <Input
                value={filter.query}
                placeholder="이름 또는 이메일"
                onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">권한</label>
              <select
                value={filter.role}
                onChange={(e) => setFilter((prev) => ({ ...prev, role: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
              >
                <option value="">전체</option>
                {combeRoles.map((role) => (
                  <option key={role.dtl_cd} value={role.dtl_cd}>{role.dtl_nm}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">상태</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
              >
                <option value="">전체</option>
                {combeStatus.map((status) => (
                  <option key={status.dtl_cd} value={status.dtl_cd}>{status.dtl_nm}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid h-[calc(100vh-28rem)] grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-semibold">사용자 목록</CardTitle>
            <CardDescription>{filteredUsers.length}건</CardDescription>
          </CardHeader>
          <CardContent>
            <GridTable columns={columns} data={users} isLoading={loading} onRowClick={handleRowClick} selectedRowId={selectedId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">사용자 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-x-6 gap-y-5 p-3">
                    {/* 아이디 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">아이디</label>
                      <Input
                        className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
                        value={editing.id || ''}
                        onChange={(e) => onInputChange('id', e.target.value)}
                        placeholder="아이디를 입력하세요"
                        readOnly={!!selectedId} // 수정 시 아이디 변경 불가
                        disabled={!!selectedId}
                      />
                    </div>

                    {/* 비밀번호 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">비밀번호</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all pr-10"
                          value={editing.password || ''}
                          onChange={(e) => onInputChange('password', e.target.value)}
                          placeholder={selectedId ? "변경시에만 입력하세요" : "비밀번호를 입력하세요"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          tabIndex="-1" // 탭 순서에서 제외 (원한다면 제거 가능)
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">비밀번호 확인</label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all pr-10"
                          value={editing.passwordConfirm || ''}
                          onChange={(e) => onInputChange('passwordConfirm', e.target.value)}
                          placeholder="비밀번호를 다시 입력하세요"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          tabIndex="-1"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    {/* 이름 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">이름</label>
                      <Input
                        className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
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
                        className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
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
                        className="block h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 cursor-pointer appearance-none"
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
                        className="block h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                      >
                        {combeStatus.map((status) => (
                          <option key={status.dtl_cd} value={status.dtl_cd}>{status.dtl_nm}</option>
                        ))}
                      </select>
                    </div>

                    {/* 전화번호 (전체 너비) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">전화번호</label>
                      <Input
                        className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
                        value={editing.phone || ''}
                        onChange={(e) => onInputChange('phone', e.target.value)}
                        placeholder="010-0000-0000"
                        maxLength="13"
                      />
                    </div>                
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
