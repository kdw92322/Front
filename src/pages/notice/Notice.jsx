import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { API_BASE_URL } from '@/lib/config';
import axios from '../../lib/axios';
import GridTable from '@/components/layout/GridTable';

export function Notice() {
    const [notices, setNotices] = useState([]);
    const [filter, setFilter] = useState({ title: '' });
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);

    const initForm = {
        notice_id: '',
        title: '',
        content: '',
        author: '',
        use_yn: 'Y',
        reg_date: ''
    };
    const [editing, setEditing] = useState(initForm);

    useEffect(() => {
        search();
    }, []);

    const search = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/notice/select`, { params: filter });
            setNotices(response.data || []);
        } catch (error) {
            console.error('공지사항 조회 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    const onNewForm = () => {
        setEditing(initForm);
        setSelectedId(null);
    };

    const onSave = async () => {
        if (!editing.title || !editing.content) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        try {
            if (selectedId) {
                await axios.put(`${API_BASE_URL}/notice/update`, editing);
            } else {
                await axios.post(`${API_BASE_URL}/notice/insert`, editing);
            }
            alert('저장되었습니다.');
            search();
            onNewForm();
        } catch (error) {
            console.error('저장 오류:', error);
            alert('저장에 실패했습니다.');
        }
    };

    const onDelete = async () => {
        if (!selectedId) return;
        if (window.confirm('선택한 공지사항을 삭제하시겠습니까?')) {
            try {
                await axios.post(`${API_BASE_URL}/notice/delete`, { notice_id: selectedId });
                alert('삭제되었습니다.');
                search();
                onNewForm();
            } catch (error) {
                console.error('삭제 오류:', error);
            }
        }
    };

    const handleRowClick = (rowData) => {
        setSelectedId(rowData.notice_id);
        setEditing({ ...rowData });
    };

    const columns = useMemo(() => [
        { accessorKey: 'notice_id', header: '번호', size: 1 },
        { accessorKey: 'title', header: '제목', size: 5 },
        { accessorKey: 'author', header: '작성자', size: 2 },
        { accessorKey: 'reg_date', header: '작성일', size: 2 },
    ], []);

    return (
        <main className="h-full flex flex-col p-3 overflow-hidden">
            {/* 헤더 영역 */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <CardTitle className="text-lg">공지사항 관리</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => setFilter({ title: '' })}>초기화</Button>
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={onNewForm}>신규</Button>
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={search}>조회</Button>
                    <Button variant="default" size="sm" className="h-8 px-6" onClick={onSave}>저장</Button>
                    <Button variant="destructive" size="sm" className="h-8 px-6" onClick={onDelete}>삭제</Button>
                </div>
            </div>

            {/* 조회 조건 */}
            <Card className="mb-4 shrink-0">
                <CardContent className="p-4">
                    <div className="flex gap-4 items-end">
                        <div className="w-1/3">
                            <Label className="text-xs mb-1">제목 검색</Label>
                            <Input 
                                placeholder="검색할 제목을 입력하세요" 
                                value={filter.title}
                                onChange={(e) => setFilter({ ...filter, title: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && search()}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-1 gap-4 min-h-0">
                {/* 왼쪽: 목록 */}
                <Card className="w-1/2 flex flex-col overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b bg-slate-50">
                        <CardTitle className="text-sm font-semibold">공지사항 목록</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto">
                            <GridTable 
                                columns={columns} 
                                data={notices} 
                                onRowClick={handleRowClick}
                                selectedRowId={selectedId}
                                rowKey="notice_id"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 오른쪽: 상세 정보 및 작성 */}
                <Card className="w-1/2 flex flex-col overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b bg-slate-50">
                        <CardTitle className="text-sm font-semibold">공지사항 상세</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label className="text-xs">제목</Label>
                                <Input 
                                    value={editing.title} 
                                    onChange={(e) => setEditing({...editing, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">작성자</Label>
                                <Input 
                                    value={editing.author} 
                                    onChange={(e) => setEditing({...editing, author: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">사용 여부</Label>
                                <RadioGroup 
                                    value={editing.use_yn} 
                                    onValueChange={(val) => setEditing({...editing, use_yn: val})}
                                    className="flex gap-4 mt-2"
                                >
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Y" id="use_y" /><Label htmlFor="use_y">사용</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="N" id="use_n" /><Label htmlFor="use_n">미사용</Label></div>
                                </RadioGroup>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs">내용</Label>
                                <Textarea 
                                    className="h-64 resize-none"
                                    value={editing.content}
                                    onChange={(e) => setEditing({...editing, content: e.target.value})}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
export default Notice;