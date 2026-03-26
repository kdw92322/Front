import React, { useMemo, useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/config'
import axios from '../../lib/axios';
import GridTable from '@/components/layout/GridTable';
import { Text } from '@/components/gridcol/Text';
import { Select } from '@/components/gridcol/Select';
import { Check } from '@/components/gridcol/Check';
import { TextArea } from '@/components/gridcol/TextArea';

export function CodeManagement() {
    const [filter, setFilter] = useState({});
    const [dtlParams, setDtlParams] = useState({});
    const [codes, setCodes] = useState([]);
    const [codeDtls, setCodeDtls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMst, setSelectedMst] = useState(null);
    const [selectedMstId, setSelectedMstId] = useState(null);
    const [selectedDtlId, setSelectedDtlId] = useState(null);
    const [selectedDtlIndex, setSelectedDtlIndex] = useState(null);
    
    useEffect(() => {
        const init = async () => {
          search();
        };
        init();
    }, []);

    useEffect(() => {
        if (dtlParams.mst_cd) {
          searchDtl(dtlParams);
        }
    }, [dtlParams])

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
    
    const searchDtlParam = (mst_cd) => {
      setDtlParams({ mst_cd : mst_cd });
    }   

    const searchDtl = async (params) => {
      try {
          const response = await axios.get(`${API_BASE_URL}/code/selectDtl`, { params: params })
          setCodeDtls(response.data);
          //return response.data;
      } catch (error) {
        console.error('검색 중 오류:', error)
        //return [];
      }
    }

    const save = async () => {
      const inserts = codeDtls.filter(row => row.status === 'I');
      const updates = codeDtls.filter(row => row.status === 'U');

      if (inserts.length === 0 && updates.length === 0) {
        alert('저장할 변경사항이 없습니다.');
        return;
      }
    
      try {
        const response = await axios.post(`${API_BASE_URL}/code/save`, { inserts:inserts, updates:updates });
        alert('저장되었습니다.');
        search();
        if(dtlParams.mst_cd) searchDtl(dtlParams);           
      } catch (error) {
        console.error('저장 중 오류:', error);
        alert('저장에 실패했습니다.');
      }
    }

    const mst_columns = [
      { accessorKey: 'mst_cd', header: '코드그룹', size: 1 },    // 1의 비율
      { accessorKey: 'mst_nm', header: '코드그룹명', size: 2 },  // 3의 비율 (3배 넓음)
    ];

    const dtl_columns = [
      { accessorKey: 'dtl_cd', header: '코드',
        cell: ({ getValue,row,column, table }) => Text({ getValue, row, column, table })
      },    // 1의 비율
      { accessorKey: 'dtl_nm', header: '코드명',
        cell: ({ getValue,row,column, table }) => Text({ getValue, row, column, table }) 
      },  
      { accessorKey: 'use_yn', header: '사용여부',
        cell: (props) => Check(props)
      },
      { accessorKey: 'remark', header: '비고',
        cell: ({ getValue,row,column, table }) => Text({ getValue, row, column, table }) 
      },
      { accessorKey: 'attr1', header: '속성1',
        cell: ({ getValue,row,column, table }) => Text({ getValue, row, column, table })
      },
      { accessorKey: 'attr2', header: '속성2',
        cell: ({ getValue,row,column, table }) => Text({ getValue, row, column, table })
      },
      { accessorKey: 'attr3', header: '속성3',
        cell: ({ getValue,row,column, table }) => Text({ getValue, row, column, table })
      },
    ];
    
    const handleMstRowClick = (rowData) => {
      const mst_cd = rowData.mst_cd;
      setSelectedMst(rowData);
      // 선택된 코드그룹의 상세 코드 조회
      searchDtlParam(mst_cd);
      setSelectedMstId(mst_cd);
    }

    const handleDtlRowClick = (rowData, index) => {
      const dtl_cd = rowData.dtl_cd;
      setSelectedDtlId(dtl_cd);
      setSelectedDtlIndex(index);
    }

    const addRow = () => {
      if (!selectedMst) {
        alert('코드그룹을 먼저 선택해주세요.');
        return;
      }
      const newRow = {
        mst_cd: selectedMst.mst_cd,
        dtl_cd: '',
        dtl_nm: '',     
        use_yn: 'Y',
        remark: '',
        attr1: '',
        attr2: '',
        attr3: '',
        status: "I"
      };
      setCodeDtls((prev) => [...prev, newRow]);
    }
    
    const delRow = async () => {
      if (selectedDtlIndex === null) {
        alert('삭제할 행을 선택해주세요.');
        return;
      }
      
      const rowToDelete = codeDtls[selectedDtlIndex];

      // 새로 추가된 행은 서버에 없으므로 상태에서만 제거
      if (rowToDelete.status === 'I') {
        if (window.confirm('선택한 행을 삭제하시겠습니까?')) {
          setCodeDtls((prev) => prev.filter((_, index) => index !== selectedDtlIndex));
          setSelectedDtlId(null);
          setSelectedDtlIndex(null);
        }
        return;
      }

      // 기존에 있던 행은 서버에 삭제 요청
      if (window.confirm('선택한 행을 삭제하시겠습니까? 이 작업은 즉시 서버에 반영됩니다.')) {
        try {
          await axios.post(`${API_BASE_URL}/code/delete`, { dtl: rowToDelete });
          alert('삭제되었습니다.');
          // 상세 코드 목록 새로고침
          searchDtl(dtlParams);
          setSelectedDtlId(null);
          setSelectedDtlIndex(null);
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
                  <CardTitle className="text-lg">코드관리</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => searchCondInit()}>
                      초기화
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => search()}>
                      조회
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => save()}>
                      저장
                    </Button>
                </div>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                <div>
                  <CardTitle className="text-sm font-semibold">조회조건</CardTitle>
                </div>
              </CardHeader>  
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">코드그룹</label>
                    <Input
                      value={filter.mst_cd}
                      onChange={(e) => setFilter((prev) => ({ ...prev, mst_cd: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">코드그룹명</label>
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
                  <CardTitle className="text-sm font-semibold">코드그룹 목록</CardTitle>
                </CardHeader>
                <CardContent>
                  <GridTable 
                    columns={mst_columns} 
                    data={codes} 
                    isLoading={loading} 
                    onRowClick={handleMstRowClick} 
                    selectedRowId={selectedMstId}
                    rowKey="mst_cd"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                  <div>
                    <CardTitle className="text-sm font-semibold">코드목록</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="h-8 px-6 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => addRow()}>
                      추가
                    </Button>
                    <Button size="sm" className="h-8 px-6 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => delRow()}>
                      삭제
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <GridTable 
                    columns={dtl_columns} 
                    data={codeDtls} 
                    onRowClick={handleDtlRowClick} 
                    selectedRowId={selectedDtlId}
                    setData={setCodeDtls}
                    rowKey="dtl_cd"
                  />        
                </CardContent>
              </Card>
            </div>
      </main>  
    )
}
