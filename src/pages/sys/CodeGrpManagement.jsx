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
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        const init = async () => {
          onSearch();
        };
      init();
    }, []);

    const initForm = {
        mstCd: "",
        mstNm: "",
        useYn: "Y",
        remark: "",
        attr1: "",
        attr2: "",
        attr3: "",
    }

    const [formData, setFormData] = useState(initForm);

    const onNewForm = () => {
      setSelected(null);
      setSelectedId(null);
      setCodes([]);
      setFormData(initForm);
    }

    const onInputChange = (key, value) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
    }  

    const searchCondInit = () => {
      setFilter({ mstNm: '', mstCd: '' })
    } 

    const onSearch = async () => {
      try {
          const response = await axios.get(`${API_BASE_URL}/code/select`, { params: filter })
          console.log(response.data);
          setCodes(response.data);
          //return response.data;
      } catch (error) {
        console.error('검색 중 오류:', error)
        //return [];
      }
    }

    const onSave = async () => {
      try {
          if (selectedId) {
            await axios.put(`${API_BASE_URL}/codeGrp/update`, formData);
          } else {
            await axios.post(`${API_BASE_URL}/codeGrp/insert`, formData);
          }
          alert('저장되었습니다.');
          callAfterSaveProcess();
      } catch (error) {
        console.error('저장 중 오류:', error);
        alert('저장에 실패했습니다.');
      }   
    }

    const onDelete = async () => {
      try {
        if (window.confirm('선택한 행을 삭제하시겠습니까? 이 작업은 즉시 서버에 반영됩니다.')) {
          await axios.delete(`${API_BASE_URL}/codeGrp/delete`, { data: { mstCd: selectedId } });
          alert('삭제되었습니다.');
          callAfterSaveProcess();
        }
      } catch (error) {
        console.error('삭제 중 오류:', error);
        alert('삭제에 실패했습니다.');
      }
    }

    const columns = [
      { accessorKey: 'mstCd', header: '코드그룹', size: 1 },   
      { accessorKey: 'mstNm', header: '코드그룹명', size: 2 }, 

    ];
    
    const handleRowClick = (rowData) => {
      setSelected(rowData.mstCd);
      setSelectedId(rowData.mstCd);
      setFormData({
        mstCd: rowData.mstCd,
        mstNm: rowData.mstNm,
        useYn: rowData.useYn,
        remark: rowData.remark,
        attr1: rowData.attr1,
        attr2: rowData.attr2,
        attr3: rowData.attr3,
      });
    } 

    const callAfterSaveProcess = () => {
      onSearch();
      setFormData(initForm);
      setSelected(null);
      setSelectedId(null);
      setCodes([]);

      return;
    }

    return (
        <main className="h-full overflow-y-auto p-3 scrollbar-hidden">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <CardTitle className="text-lg">코드그룹 관리</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => searchCondInit()}>
                      초기화
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => onNewForm()}>
                      신규
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => onSearch()}>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                <div>
                  <CardTitle className="text-sm font-semibold">조회조건</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">코드그룹</label>
                    <Input
                      value={filter.mstCd || ""}
                      onChange={(e) => setFilter((prev) => ({ ...prev, mstCd: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">코드그룹 명</label>
                    <Input
                      value={filter.mstNm || ""}
                      onChange={(e) => setFilter((prev) => ({ ...prev, mstNm: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 grid h-[calc(100vh-28rem)] grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr]">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                  <CardTitle className="text-sm font-semibold">코드그룹 목록</CardTitle>
                </CardHeader>
                <CardContent>
                  <GridTable columns={columns} data={codes} onRowClick={handleRowClick} selectedRowId={selectedId}/>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                  <CardTitle className="text-sm font-semibold">코드그룹 정보</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-x-6 gap-y-5 p-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">코드그룹</label>
                        <Input
                            type="text"
                            className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
                            onChange={(e) => onInputChange('mstCd', e.target.value)}
                            placeholder="코드그룹을 입력하세요"
                            value={formData.mstCd}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">코드그룹명</label>
                        <Input
                            type="text"
                            className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"      
                            onChange={(e) => onInputChange('mstNm', e.target.value)}
                            placeholder="코드그룹 명을 입력하세요"
                            value={formData.mstNm}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">사용 여부</label>
                            <RadioGroup 
                                value={formData.useYn} 
                                onValueChange={(value) => onInputChange('useYn', value)}
                                className="flex flex-col gap-3"
                            >
                                <div className="flex items-center space-x-2 scale-90 origin-left">
                                    <RadioGroupItem value="Y" id="r1" className="scale-90" />
                                    <Label htmlFor="r1">사용</Label>
                                </div>
                                    
                                <div className="flex items-center space-x-2 scale-90 origin-left">
                                    <RadioGroupItem value="N" id="r2" className="scale-90" />
                                    <Label htmlFor="r2">미사용</Label>
                                </div>
                            </RadioGroup>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">속성1</label>
                        <Input
                                type="text"
                                value={formData.attr1}
                                className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"      
                                onChange={(e) => onInputChange('attr1', e.target.value)}
                                placeholder="속성1를 입력하세요"
                            />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">속성2</label>
                        <Input
                                type="text"
                                value={formData.attr2}
                                className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"      
                                onChange={(e) => onInputChange('attr2', e.target.value)}
                                placeholder="속성2를 입력하세요"
                            />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">속성3</label>
                        <Input
                                type="text"
                                value={formData.attr3}
                                className="h-8 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"      
                                onChange={(e) => onInputChange('attr3', e.target.value)}
                                placeholder="속성3를 입력하세요"
                            />
                    </div>
                    <div className="col-span-3">
                        <label className="mb-1 block text-xs font-medium text-slate-700">비고</label>
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
