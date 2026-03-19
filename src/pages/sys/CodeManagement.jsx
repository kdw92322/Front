import React, { useMemo, useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/config'
import axios from '../../lib/axios';
import GridTable from '@/components/layout/GridTable';

export function CodeManagement() {
    const [filter, setFilter] = useState({});
    const [codes, setCodes] = useState([]);
    const [codeDtls, setCodeDtls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(selected);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        setEditing(selected)
    }, [selected])
    
    const onInputChange = (key, value) => {
      setEditing((prev) => ({ ...prev, [key]: value }))
    }  

    const searchCondInit = () => {
      setFilter({ mst_nm: '', mst_cd: '' })
    } 

    const search = async () => {
      try {
          const response = await axios.get(`${API_BASE_URL}/code/select`, { params: filter })
          //console.log(response.data);
          setCodes(response.data);
          //return response.data;
      } catch (error) {
        console.error('검색 중 오류:', error)
        //return [];
      }
    }

    const mst_columns = [
      { accessorKey: 'mst_cd', header: '코드그룹', size: 1 },    // 1의 비율
      { accessorKey: 'mst_nm', header: '코드그룹명', size: 2 },  // 3의 비율 (3배 넓음)
    ];

    const dtl_columns = [
      { accessorKey: 'mst_cd', header: '코드그룹', size: 1 },    // 1의 비율
      { accessorKey: 'dtl_cd', header: '코드', size: 1 },    // 1의 비율
      { accessorKey: 'dtl_nm', header: '코드명', size: 2 },  // 3의 비율 (3배 넓음)
      { accessorKey: 'use_yn', header: '사용 여부', size: 1 },
      { accessorKey: 'remark', header: '비고', size: 2 },
      { accessorKey: 'attr1', header: '속성1', size: 1 },
      { accessorKey: 'attr2', header: '속성2', size: 1 },
      { accessorKey: 'attr3', header: '속성3', size: 1 },
    ];
    
    const handleMstRowClick = (rowData) => {
      setSelected(rowData.mst_cd); // 선택된 데이터 저장 (하이라이트용)
      setSelectedId(rowData.mst_cd); // 선택된 ID 저장 (하이라이트용)
    }
    
    const handleDtlRowClick = (rowData) => {
      
    }

    return (
      <main className="h-full overflow-y-auto p-3 scrollbar-hidden">
            <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>코드관리</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => searchCondInit()}>
                      초기화
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => search()}>
                      조회
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => search()}>
                      저장
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => search()}>
                      삭제
                    </Button>
                </div>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                <div>
                  <CardTitle className="text-lg font-semibold">조회조건</CardTitle>
                </div>
              </CardHeader>  
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">코드그룹</label>
                    <Input
                      value={filter.mst_cd}
                      onChange={(e) => setFilter((prev) => ({ ...prev, mst_cd: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">코드그룹명</label>
                    <Input
                      value={filter.mst_nm}
                      onChange={(e) => setFilter((prev) => ({ ...prev, mst_nm: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 grid h-[calc(100vh-25rem)] grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr]">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                  <CardTitle className="text-lg font-semibold">코드그룹 목록</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <GridTable columns={mst_columns} data={codes} isLoading={loading} onRowClick={handleMstRowClick} selectedRowId={selectedId}/>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                  <CardTitle className="text-lg font-semibold">코드목록</CardTitle>
                </CardHeader>
                <CardContent>
                  <GridTable columns={dtl_columns} data={codeDtls} isLoading={loading} onRowClick={handleDtlRowClick} selectedRowId={selectedId}/>        
                </CardContent>
              </Card>
            </div>
      </main>  
    )
}
