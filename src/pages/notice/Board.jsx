import React from 'react'
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { API_BASE_URL } from '@/lib/config';
import axios from '../../lib/axios';
import GridTable from '@/components/layout/GridTable';
import { getCodeDetails } from '../../lib/code';

export function Board() {
    const [boards, setBoards] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filter, setFilter] = useState({ title: '', category: '' });
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);

    const initForm = {
        board_id: '',
        category: 'GENERAL',
        title: '',
        content: '',
        author: '',
        use_yn: 'Y',
        reg_date: ''
    };
    const [editing, setEditing] = useState(initForm);

    useEffect(() => {
        const init = async () => {
            // 공통 코드에서 게시판 카테고리 정보 로드 (있을 경우)
            const cats = await getCodeDetails('board_cat');
            if (cats) setCategories(cats);
            search();
        };
        init();
    }, []);

    const search = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/board/select`, { params: filter });
            setBoards(response.data || []);
        } catch (error) {
            console.error('게시판 조회 오류:', error);
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
                await axios.put(`${API_BASE_URL}/board/update`, editing);
            } else {
                await axios.post(`${API_BASE_URL}/board/insert`, editing);
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
        if (window.confirm('선택한 게시글을 삭제하시겠습니까?')) {
            try {
                await axios.post(`${API_BASE_URL}/board/delete`, { board_id: selectedId });
                alert('삭제되었습니다.');
                search();
                onNewForm();
            } catch (error) {
                console.error('삭제 오류:', error);
            }
        }
    };

    const handleRowClick = (rowData) => {
        setSelectedId(rowData.board_id);
        setEditing({ ...rowData });
    };

    const columns = useMemo(() => [
        { accessorKey: 'board_id', header: '번호', size: 1 },
        { accessorKey: 'category', header: '분류', size: 1.5 },
        { accessorKey: 'title', header: '제목', size: 5 },
        { accessorKey: 'author', header: '작성자', size: 2 },
        { accessorKey: 'reg_date', header: '작성일', size: 2 },
    ], []);

    return (
        <div>
            <h1>게시판 관리</h1>
        </div>
    )
        <main className="h-full flex flex-col p-3 overflow-hidden">
            {/* 버튼 툴바 */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <CardTitle className="text-lg">게시판 관리</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={() => { setFilter({ title: '', category: '' }); search(); }}>초기화</Button>
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={onNewForm}>신규</Button>
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={search}>조회</Button>
                    <Button variant="default" size="sm" className="h-8 px-6" onClick={onSave}>저장</Button>
                    <Button variant="destructive" size="sm" className="h-8 px-6" onClick={onDelete}>삭제</Button>
                </div>
            </div>

            {/* 검색 필터 */}
            <Card className="mb-4 shrink-0">
                <CardContent className="p-4">
                    <div className="flex gap-4 items-end">
                        <div className="w-1/4">
                            <Label className="text-xs mb-1">분류</Label>
                            <select 
                                className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                                value={filter.category}
                                onChange={(e) => setFilter({...filter, category: e.target.value})}
                            >
                                <option value="">전체</option>
                                {categories.map(c => <option key={c.dtl_cd} value={c.dtl_cd}>{c.dtl_nm}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <Label className="text-xs mb-1">제목 검색</Label>
                            <Input 
                                placeholder="검색어를 입력하세요" 
                                value={filter.title}
                                onChange={(e) => setFilter({ ...filter, title: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && search()}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-1 gap-4 min-h-0">
                {/* 리스트 영역 */}
                <Card className="w-1/2 flex flex-col overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b bg-slate-50">
                        <CardTitle className="text-sm font-semibold">게시글 목록</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <GridTable 
                            columns={columns} 
                            data={boards} 
                            onRowClick={handleRowClick}
                            selectedRowId={selectedId}
                            rowKey="board_id"
                        />
                    </CardContent>
                </Card>

                {/* 상세/편집 영역 */}
                <Card className="w-1/2 flex flex-col overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b bg-slate-50">
                        <CardTitle className="text-sm font-semibold">상세 내용</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <Label className="text-xs">분류</Label>
                                <select 
                                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm mt-1"
                                    value={editing.category}
                                    onChange={(e) => setEditing({...editing, category: e.target.value})}
                                >
                                    {categories.map(c => <option key={c.dtl_cd} value={c.dtl_cd}>{c.dtl_nm}</option>)}
                                    {categories.length === 0 && <option value="GENERAL">일반</option>}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <Label className="text-xs">작성자</Label>
                                <Input className="mt-1" value={editing.author} onChange={(e) => setEditing({...editing, author: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs">제목</Label>
                                <Input className="mt-1" value={editing.title} onChange={(e) => setEditing({...editing, title: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs">내용</Label>
                                <Textarea 
                                    className="h-80 mt-1 resize-none font-sans"
                                    value={editing.content}
                                    onChange={(e) => setEditing({...editing, content: e.target.value})}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs">사용 여부</Label>
                                <RadioGroup 
                                    value={editing.use_yn} 
                                    onValueChange={(val) => setEditing({...editing, use_yn: val})}
                                    className="flex gap-4 mt-2"
                                >
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Y" id="b_use_y" /><Label htmlFor="b_use_y">공개</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="N" id="b_use_n" /><Label htmlFor="b_use_n">비공개</Label></div>
                                </RadioGroup>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

export default Board;