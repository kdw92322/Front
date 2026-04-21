import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { API_BASE_URL } from '@/lib/config';
import axios from '../../lib/axios';
import GridTable from '@/components/layout/GridTable';
import { IoClose } from 'react-icons/io5';

export function Notice() {
    const [notices, setNotices] = useState([]);
    const [filter, setFilter] = useState({ title: '' });
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    // 로그인한 사용자 정보 가져오기
    const loginId = localStorage.getItem('userId');

    const initForm = {
        id: '',
        title: '',
        content: '',
        writer: loginId,
        useYn: 'Y',
        regDate: '',
        file: null,
        fileName: ''
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
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onSave = async () => {
        if (!editing.title || !editing.content) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('title', editing.title);
        formData.append('content', editing.content);
        formData.append('writer', editing.writer);
        formData.append('useYn', editing.useYn || 'Y');
        
        if (selectedId) formData.append('id', selectedId);
        if (editing.file) {
            formData.append('file', editing.file);
        }

        try {
            if (selectedId) {
                await axios.put(`${API_BASE_URL}/notice/update`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post(`${API_BASE_URL}/notice/insert`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
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
                await axios.post(`${API_BASE_URL}/notice/delete`, { id: selectedId });
                alert('삭제되었습니다.');
                search();
                onNewForm();
            } catch (error) {
                console.error('삭제 오류:', error);
            }
        }
    };

    const onClearFile = () => {
        setEditing(prev => ({
            ...prev,
            file: null,
            file_name: ''
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditing(prev => ({
                ...prev,
                file: file,
                file_name: file.name
            }));
        }
    };

    const handleRowClick = async (rowData) => {
        console.log(rowData);
        setSelectedId(rowData.id);
        setEditing({ ...rowData });

        try {
            // 서버에 조회수 증가 요청 (API 엔드포인트는 백엔드 설계에 맞춰 조정 필요)
            await axios.post(`${API_BASE_URL}/notice/updateViewCount`, { id: rowData.id });
            
            const updatedCount = (rowData.view_count || 0) + 1;

            // 목록 상태 업데이트: 클릭한 행의 조회수를 1 증가시킴
            setNotices(prev => prev.map(item => 
                item.id === rowData.id 
                ? { ...item, view_count: updatedCount } 
                : item
            ));
            
            // 상세 정보 상태(editing)에도 증가된 조회수 반영
            setEditing(prev => ({ ...prev, view_count: updatedCount }));
        } catch (error) {
            console.error('조회수 증가 처리 중 오류:', error);
        }
    };

    const columns = useMemo(() => [
        { accessorKey: 'id', header: '번호', size: 1 },
        { accessorKey: 'title', header: '제목', size: 5 },
        { accessorKey: 'writer', header: '작성자', size: 2 },
        { accessorKey: 'createDt', header: '작성일', size: 2 },
        { accessorKey: 'viewCount', header: '조회수', size: 2 },
    ], []);

    return (
        <main className="h-full flex flex-col p-3 overflow-hidden">
            {/* 헤더 영역 */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <CardTitle className="text-lg">공지사항</CardTitle>
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
                                rowKey="id"
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
                                    className="bg-slate-50"
                                    value={editing.writer} 
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div>
                                <Label className="text-xs">첨부파일</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input 
                                            className="bg-slate-50 h-9 pr-8"
                                            value={editing.file_name || ''} 
                                            readOnly
                                            placeholder="선택된 파일 없음"
                                        />
                                        {editing.file_name && (
                                            <button
                                                type="button"
                                                onClick={onClearFile}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <IoClose size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <Button variant="outline" size="sm" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
                                        파일 선택
                                    </Button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={handleFileChange} 
                                    />
                                </div>
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