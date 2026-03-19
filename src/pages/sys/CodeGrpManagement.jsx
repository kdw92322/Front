import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label"
import { Checkbox } from '@/components/ui/Checkbox';
import { Textarea } from "@/components/ui/Textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { API_BASE_URL } from '@/lib/config'
import axios from '../../lib/axios';
import GridTable from '@/components/layout/GridTable';


export function CodeGrpManagement() {
    const [filter, setFilter] = useState({});
    const [codes, setCodes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [selectedValue, setSelectedValue] = useState("Y");
    const [editing, setEditing] = useState(selected);
    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState({
        mst_cd: "",
        mst_nm: "",
        use_yn: "Y",
        remark: "",
        attr1: "",
        attr2: "",
        attr3: "",
    });


    useEffect(() => {
        setEditing(selected)
    }, [selected])
    
    // 값이 바뀔 때 실행될 함수
    const handleValueChange = (value) => {
        setSelectedValue(value)
    }    

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

    const columns = [
      { accessorKey: 'mst_cd', header: '코드그룹', size: 1 },   
      { accessorKey: 'mst_nm', header: '코드그룹명', size: 1 }, 

    ];
    
    const handleRowClick = (rowData) => {
      setSelected(rowData.mst_cd);
      setSelectedId(rowData.mst_cd);
      setFormData({
        mst_cd: rowData.mst_cd,
        mst_nm: rowData.mst_nm,
        use_yn: rowData.use_yn,
        remark: rowData.remark,
        attr1: rowData.attr1,
        attr2: rowData.attr2,
        attr3: rowData.attr3,
      });
    } 

    return (
        <main className="h-full overflow-y-auto p-3 scrollbar-hidden">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <CardTitle>코드그룹 관리</CardTitle>
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
                      value={filter.mst_cd || ""}
                      onChange={(e) => setFilter((prev) => ({ ...prev, mst_cd: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">코드그룹 명</label>
                    <Input
                      value={filter.mst_nm || ""}
                      onChange={(e) => setFilter((prev) => ({ ...prev, mst_nm: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 grid h-[calc(100vh-28rem)] grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr]">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                  <CardTitle className="text-lg font-semibold">코드그룹 목록</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <GridTable columns={columns} data={codes} onRowClick={handleRowClick} selectedRowId={selectedId}/>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                  <CardTitle className="text-lg font-semibold">코드그룹 정보</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-x-6 gap-y-5 p-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">코드그룹</label>
                        <Input
                            type="text"
                            className="h-10 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
                            onChange={(e) => onInputChange('mst_cd', e.target.value)}
                            placeholder="코드그룹을 입력하세요"
                            value={formData.mst_cd}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">코드그룹 명</label>
                        <Input
                            type="text"
                            className="h-10 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"      
                            onChange={(e) => onInputChange('mst_nm', e.target.value)}
                            placeholder="코드그룹 명을 입력하세요"
                            value={formData.mst_nm}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">사용 여부</label>
                            <RadioGroup 
                                value={formData.use_yn} 
                                onValueChange={handleValueChange}
                                className="flex flex-col gap-3"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Y" id="r1" />
                                    <Label htmlFor="r1">사용</Label>
                                </div>
                                    
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="N" id="r2" />
                                    <Label htmlFor="r2">미사용</Label>
                                </div>
                            </RadioGroup>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">속성1</label>
                        <Input
                                type="text"
                                value={formData.attr1}
                                className="h-10 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"      
                                onChange={(e) => onInputChange('attr1', e.target.value)}
                                placeholder="속성1를 입력하세요"
                            />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">속성2</label>
                        <Input
                                type="text"
                                value={formData.attr2}
                                className="h-10 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"      
                                onChange={(e) => onInputChange('attr2', e.target.value)}
                                placeholder="속성2를 입력하세요"
                            />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">속성3</label>
                        <Input
                                type="text"
                                value={formData.attr3}
                                className="h-10 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"      
                                onChange={(e) => onInputChange('attr3', e.target.value)}
                                placeholder="속성3를 입력하세요"
                            />
                    </div>
                    <div className="col-span-3">
                        <label className="mb-1 block text-sm font-medium text-slate-700">비고</label>
                        <Textarea 
                            placeholder="비고를 입력하세요"
                            className="resize-none" // 우측 하단 크기 조절 핸들 제거
                            value={formData.remark}
                            onChange={(e) => onInputChange('remark', e.target.value)}
                        />
                    </div>
                </CardContent>
              </Card>
            </div>
        </main>  
    )
}
