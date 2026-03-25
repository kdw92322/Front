import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import GridTable from '@/components/layout/GridTable';
import { Text } from '@/components/gridcol/Text';
import { Check } from '@/components/gridcol/Check';
import { API_BASE_URL } from '@/lib/config';
import axios from '../../lib/axios';

export function MenuManagement() {
    // --- State ---
    const [menus, setMenus] = useState([]); // 전체 메뉴 리스트 (Flat Data)
    const [treeData, setTreeData] = useState([]); // 트리 구조 데이터
    const [selectedNode, setSelectedNode] = useState(null); // 트리에서 선택된 노드
    const [childNodes, setChildNodes] = useState([]); // 그리드용 하위 노드 리스트
    const [expanded, setExpanded] = useState({}); // 트리 확장 상태

    // 폼 데이터 (우측 상단)
    const initForm = {
        code: "",
        parentcode: "ROOT",
        name: "",
        path: "",
        order: 0,
        useYn: "",
        remark: ""
    };
    const [formData, setFormData] = useState(initForm);

    // --- Effects ---
    useEffect(() => {
        loadMenus();
    }, []);

    // 트리 선택 변경 시 그리드 및 폼 데이터 갱신
    useEffect(() => {
        if (selectedNode) {
            setFormData(selectedNode);
            
            // Parent코드가 ROOT인 경우(최상위 메뉴)에만 하위 메뉴 목록 표시
            if (selectedNode.parentcode === 'ROOT' || !selectedNode.parentcode) {
                const children = menus.filter(m => m.parentcode === selectedNode.code);
                setChildNodes(children.map(c => ({ ...c, status: '' })));
            } else {
                setChildNodes([]);
            }
        } else {
            setFormData(initForm);
            setChildNodes([]);
        }
    }, [selectedNode, menus]);

    // --- Functions: Data Loading & Tree Building ---
    const loadMenus = async () => {
        try {
            // 실제 API 호출로 가정: /menu/select
            const response = await axios.get(`${API_BASE_URL}/menu/select`);
            // 데이터가 없다면 더미 데이터라도 사용 (테스트용)
            const data = response.data || [];
            setMenus(data);
            setTreeData(buildTree(data, 'ROOT'));
        } catch (error) {
            console.error('메뉴 조회 오류:', error);
        }
    };

    // Flat Data -> Tree Structure 변환
    const buildTree = (items, parentId) => {
        return items
            .filter(item => item.parentcode === parentId || (!parentId && !item.parentcode))
            .map(item => ({
                ...item,
                children: buildTree(items, item.code)
            }))
            .sort((a, b) => a.order - b.order);
    };

    // --- Functions: Tree Interaction ---
    const toggleNode = (nodeId, e) => {
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };

    const handleNodeClick = (node) => {
        setSelectedNode(node);
    };

    // --- Functions: Right Top (Form) ---
    const onInputChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const onNewForm = () => {
        // 현재 선택된 노드의 하위로 추가할지, 형제로 추가할지 결정이 필요하지만
        // 여기서는 '초기화' 개념으로 ROOT 레벨 혹은 완전 신규 입력 상태로 전환
        setSelectedNode(null);
        setFormData(initForm);
    };

    const onFormSave = async () => {
        try {
            // 신규(code가 menus에 없는 경우) 혹은 수정 판단
            const isNew = !menus.find(m => m.code === formData.code);
            console.log("isNew", isNew);
            if(isNew){
                //url = '/menu/insert';
                await axios.post(`${API_BASE_URL}` + `/menu/insert`, formData);
            }else {
                //url = '/menu/update';
                await axios.put(`${API_BASE_URL}` + `/menu/update`, formData);
            }

            alert('저장되었습니다.');
            loadMenus(); // 트리 재조회
            onNewForm(); // 폼 초기화

        } catch (error) {
            console.error('폼 저장 오류:', error);
            alert('저장에 실패했습니다.');
        }
    };

    const onFormDelete = async () => {
        if (!formData.code) return;
        if (!window.confirm(`[${formData.name}] 메뉴를 삭제하시겠습니까? 하위 메뉴도 함께 삭제될 수 있습니다.`)) return;

        try {
            await axios.post(`${API_BASE_URL}/menu/delete`, { code: formData.code });
            alert('삭제되었습니다.');
            loadMenus();
            setSelectedNode(null);
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제 실패');
        }
    };

    // --- Functions: Right Bottom (Grid) ---
    const addGridRow = () => {
        if (!selectedNode) {
            alert('상위 메뉴를 먼저 선택해주세요.');
            return;
        }
        const newRow = {
            code: '',
            parentcode: selectedNode.code,
            name: '',
            path: '',
            order: childNodes.length + 1,
            useYn: 'Y',
            status: 'I' // Insert 상태
        };
        setChildNodes(prev => [...prev, newRow]);
    };

    const saveGrid = async () => {
        const inserts = childNodes.filter(row => row.status === 'I');
        const updates = childNodes.filter(row => row.status === 'U');
        const deletes = childNodes.filter(row => row.status === 'D'); // 그리드에서 삭제 처리 로직 필요 시

        if (inserts.length === 0 && updates.length === 0 && deletes.length === 0) {
            alert('변경사항이 없습니다.');
            return;
        }

        try {
            // 일괄 저장 API 호출
            await axios.post(`${API_BASE_URL}/menu/save`, { inserts, updates, deletes });
            alert('하위 메뉴가 저장되었습니다.');
            loadMenus(); // 전체 데이터 갱신
        } catch (error) {
            console.error('그리드 저장 오류:', error);
            alert('저장 실패');
        }
    };

    const deleteGridRow = () => {
         // 체크박스나 선택된 행 삭제 로직. 여기서는 마지막 행 제거 또는 선택 로직 구현 필요.
         // 편의상 마지막 행 제거 예시, 실제로는 GridTable의 selectedRowId 등을 활용해야 함.
         alert('그리드 삭제는 행 선택 기능을 구현하여 처리합니다.');
    };

    // --- Columns Definition ---
    const gridColumns = useMemo(() => [
        { accessorKey: 'code', header: '메뉴코드', size: 1, cell: (props) => Text(props) },
        { accessorKey: 'name', header: '메뉴명', size: 2, cell: (props) => Text(props) },
        { accessorKey: 'path', header: '경로(URL)', size: 2, cell: (props) => Text(props) },
        { accessorKey: 'order', header: '정렬', size: 1, cell: (props) => Text(props) },
        { accessorKey: 'useYn', header: '사용', size: 1, cell: (props) => Check(props) },
    ], []);

    // --- Recursive Tree Component ---
    const renderTreeNodes = (nodes) => {
        if (!nodes || nodes.length === 0) return null;

        return (
            <ul className="pl-4 border-l border-slate-200 ml-2">
                {nodes.map(node => {
                    const isExpanded = expanded[node.code];
                    const isSelected = selectedNode?.code === node.code;
                    const hasChildren = node.children && node.children.length > 0;

                    return (
                        <li key={node.code} className="select-none">
                            <div 
                                className={`flex items-center py-1 px-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
                                onClick={() => handleNodeClick(node)}
                            >
                                <span 
                                    className="mr-2 text-slate-400 hover:text-slate-600 p-0.5"
                                    onClick={(e) => hasChildren && toggleNode(node.code, e)}
                                >
                                    {hasChildren ? (
                                        isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />
                                    ) : <span className="w-[10px] inline-block"/>}
                                </span>
                                <span className="mr-2 text-yellow-500">
                                    {hasChildren ? (isExpanded ? <FaFolderOpen /> : <FaFolder />) : <FaFile className="text-slate-400"/>}
                                </span>
                                <span className="text-sm truncate">{node.name}</span>
                            </div>
                            {hasChildren && isExpanded && renderTreeNodes(node.children)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <main className="h-full overflow-hidden p-3 flex flex-col">
             <div className="flex items-center justify-between mb-4 shrink-0">
                <CardTitle>메뉴 관리</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadMenus}>새로고침</Button>
                </div>
            </div>

            <div className="flex flex-1 gap-4 min-h-0">
                {/* --- Left: Menu Tree --- */}
                <Card className="w-1/3 flex flex-col h-full">
                    <CardHeader className="py-3 px-4 border-b bg-slate-50">
                        <CardTitle className="text-base">메뉴 구조</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                        <div className="-ml-2">
                            {/* Root Level */}
                            {renderTreeNodes(treeData)}
                            {treeData.length === 0 && <div className="text-center text-sm text-slate-400 mt-10">데이터가 없습니다.</div>}
                        </div>
                    </CardContent>
                </Card>

                {/* --- Right Content --- */}
                <div className="w-2/3 flex flex-col gap-4">
                    
                    {/* Right Top: Node Info Form */}
                    <Card>
                        <CardHeader className="py-3 px-4 border-b flex flex-row justify-between items-center">
                            <CardTitle className="text-base">메뉴 상세 정보</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={onNewForm}>신규(초기화)</Button>
                                <Button variant="default" size="sm" onClick={onFormSave}>저장</Button>
                                <Button variant="destructive" size="sm" onClick={onFormDelete}>삭제</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-1">상위 메뉴 코드</Label>
                                    <Input value={formData.parentcode || 'ROOT'} readOnly className="bg-slate-50" />
                                </div>
                                <div>
                                    <Label className="mb-1">메뉴 코드</Label>
                                    <Input 
                                        value={formData.code} 
                                        onChange={(e) => onInputChange('code', e.target.value)}
                                        placeholder="자동생성 또는 입력"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1">메뉴명</Label>
                                    <Input 
                                        value={formData.name} 
                                        onChange={(e) => onInputChange('name', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1">URL (경로)</Label>
                                    <Input 
                                        value={formData.path} 
                                        onChange={(e) => onInputChange('path', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1">정렬 순서</Label>
                                    <Input 
                                        type="number"
                                        value={formData.order} 
                                        onChange={(e) => onInputChange('order', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1">사용 여부</Label>
                                    <RadioGroup 
                                        value={formData.useYn} 
                                        onValueChange={(val) => onInputChange('useYn', val)}
                                        className="flex gap-4 mt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Y" id="use_y" />
                                            <Label htmlFor="use_y">사용</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="N" id="use_n" />
                                            <Label htmlFor="use_n">미사용</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Bottom: Child Nodes Grid */}
                    {(formData.parentcode === 'ROOT' || !formData.parentcode) && (
                    <Card className="flex flex-col flex-1 max-h-80">
                        <CardHeader className="py-3 px-4 border-b flex flex-row justify-between items-center bg-slate-50">
                            <CardTitle className="text-base">하위 메뉴 목록</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={addGridRow}>행추가</Button>
                                {/* <Button variant="outline" size="xs" onClick={deleteGridRow}>행삭제</Button> */}
                                <Button variant="default" size="sm" onClick={saveGrid}>목록 저장</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden">
                            <div className="h-full overflow-y-auto">
                                <GridTable 
                                    columns={gridColumns} 
                                    data={childNodes} 
                                    setData={setChildNodes}
                                    rowKey="code"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    )}
                </div>
            </div>
        </main>
    )
}