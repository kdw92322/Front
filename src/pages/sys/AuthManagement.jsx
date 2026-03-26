import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import GridTable from '@/components/layout/GridTable';
import { Text } from '@/components/gridcol/Text';
import { Select } from '@/components/gridcol/Select';
import { Check } from '@/components/gridcol/Check';
import { API_BASE_URL } from '@/lib/config';
import { getCodeDetails } from '../../lib/code';
import axios from '../../lib/axios';

export function AuthManagement() {
    const [authList, setAuthList] = useState([]);
    const [filter, setFilter] = useState({ role_id: '' });
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [comboRoles, setComboRoles] = useState([]);

    useEffect(() => {
        const init = async () => {
            // Role 코드 그룹 정보 가져오기
            const roles = await getCodeDetails('role');
            if (roles) {
                setComboRoles(roles.map(r => ({ value: r.dtl_cd, label: r.dtl_nm })));
            }
            search();
        };
        init();
    }, []);

    const search = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/authMng/select`, { params: filter });
            setAuthList(response.data || []);
        } catch (error) {
            console.error('조회 오류:', error);
        }
    };

    const save = async () => {
        const inserts = authList.filter(row => row.status === 'I');
        const updates = authList.filter(row => row.status === 'U');
        
        if (inserts.length === 0 && updates.length === 0) {
            alert('저장할 변경사항이 없습니다.');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/authMng/save`, { inserts, updates });
            alert('저장되었습니다.');
            search();
        } catch (error) {
            console.error('저장 오류:', error);
            alert('저장 실패');
        }
    };

    const deleteRow = async () => {
        if (!selectedRowId) {
            alert('삭제할 행을 선택해주세요.');
            return;
        }

        const row = authList.find(r => r.role_id === selectedRowId);
        
        // 신규 행(아직 DB에 없음)인 경우 목록에서만 제거
        if (row && row.status === 'I') {
            setAuthList(prev => prev.filter(r => r.role_id !== selectedRowId));
            setSelectedRowId(null);
            return;
        }

        if (!window.confirm('선택한 권한을 삭제하시겠습니까?')) return;

        try {
            await axios.post(`${API_BASE_URL}/authMng/delete`, { role_id: selectedRowId });
            alert('삭제되었습니다.');
            search();
            setSelectedRowId(null);
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제 실패');
        }
    };

    const addRow = () => {
        const newRow = {
            role_id: '',
            use_yn: 'Y',
            remark: '',
            status: 'I'
        };
        setAuthList(prev => [...prev, newRow]);
    };

    const columns = useMemo(() => [
        { 
            accessorKey: 'role_id', 
            header: 'Role', 
            size: 1, 
            cell: ({ getValue, row, column, table }) => {
                return (
                    <select
                        value={getValue() || ''}
                        onChange={(e) => table.options.meta?.updateData(row.index, column.id, e.target.value)}
                        className="w-full h-7 bg-transparent outline-none cursor-pointer text-xs"
                    >
                        <option value="">선택</option>
                        {comboRoles.map((role) => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </select>
                );
            }
        },
        { accessorKey: 'remark', header: '설명', size: 3, cell: (props) => Text(props) },
        { accessorKey: 'use_yn', header: '사용여부', size: 1, cell: (props) => Check(props) },
    ], [comboRoles]);

    return (
        <main className="h-full flex flex-col p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <CardTitle className="text-lg">권한관리</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={search}>조회</Button>
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={save}>저장</Button>
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={deleteRow}>삭제</Button>
                </div>
            </div>

            <Card className="mb-3 shrink-0">
                <CardHeader className="py-2 px-4 border-b bg-slate-50/50">
                    <CardTitle className="text-sm font-semibold">조회조건</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <Label>Role</Label>
                            <Input 
                                value={filter.role_id} 
                                onChange={(e) => setFilter(prev => ({ ...prev, role_id: e.target.value }))} 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex flex-col flex-1 min-h-0">
                <CardHeader className="flex flex-row justify-between items-center py-2 px-4 border-b bg-slate-50">
                    <CardTitle className="text-sm font-semibold">권한 목록</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-6" onClick={addRow}>행추가</Button>
                        <Button variant="outline" size="sm" className="h-8 px-6" onClick={deleteRow}>행삭제</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        <GridTable
                            columns={columns}
                            data={authList}
                            setData={setAuthList}
                            onRowClick={(row) => setSelectedRowId(row.role_id)}
                            selectedRowId={selectedRowId}
                            rowKey="role_id"
                        />
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
