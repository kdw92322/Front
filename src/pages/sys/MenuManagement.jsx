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
import { getToken, getUserRole } from '@/lib/auth'
import axios from '../../lib/axios';

// 프로젝트 내의 모든 페이지 컴포넌트 파일 목록을 가져옴 (Vite 기능)
const pageModules = import.meta.glob('/src/pages/**/*.jsx');
const availablePaths = Object.keys(pageModules).map(key => key.replace('/src/pages/', './pages/'));
// Autocomplete를 위한 경로 목록 (src/pages/ 하위 디렉토리의 .jsx 파일만 추출)
const pathSuggestions = Object.keys(pageModules)
    .map(key => key.replace('/src/pages/', './pages/'))
    .filter(path => path.replace('./pages/', '').includes('/')); // 하위 디렉토리에 포함된 파일만 필터링

const checkFileExists = (normalizedPath) => {
    if (!normalizedPath) return true;
    return availablePaths.includes(normalizedPath);
};

/**
 * 파일 경로로부터 컴포넌트 이름을 추출하는 유틸리티
 */
const getModuleNameFromPath = async (vPath) => {
    if (!vPath) return '';
    // 경로 정규화 (Vite glob key 형식인 /src/pages/... 로 변환)
    let key = vPath.startsWith('./pages/') 
        ? vPath.replace('./pages/', '/src/pages/') 
        : `/src/pages/${vPath.replace(/^\//, '').replace(/^pages\//, '')}`;
    if (!key.endsWith('.jsx')) key += '.jsx';

    const loader = pageModules[key];
    if (!loader) return '';

    try {
        const mod = await loader();
        // 1. Default Export 이름 확인 (익명 함수가 아닌 경우)
        if (mod.default?.name && !['default', '_default', 'anonymous'].includes(mod.default.name)) {
            return mod.default.name;
        }
        // 2. Named Export 중 대문자로 시작하는 첫 번째 함수 확인
        const named = Object.keys(mod).find(k => k[0] === k[0].toUpperCase() && typeof mod[k] === 'function');
        return named || '';
    } catch (e) {
        return '';
    }
};

export function MenuManagement() {
    const token = getToken();

    // --- State ---
    const [menus, setMenus] = useState([]); // 전체 메뉴 리스트 (Flat Data)
    const [treeData, setTreeData] = useState([]); // 트리 구조 데이터
    const [selectedNode, setSelectedNode] = useState(null); // 트리에서 선택된 노드
    const [childNodes, setChildNodes] = useState([]); // 그리드용 하위 노드 리스트
    const [expanded, setExpanded] = useState({}); // 트리 확장 상태
    const [selectedChildCode, setSelectedChildCode] = useState(null); // 하위 그리드 선택 코드

    // 폼 데이터 (우측 상단)
    const initForm = {
        code: "",
        parentcode: "ROOT",
        name: "",
        path: "",
        viewPath: "",
        module: "",
        order: 0,
        useYn: "",
        popupYn: "N", // 새 창 열기 여부 추가
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
            setSelectedChildCode(null);
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

            // 조회 완료 시 모든 노드를 펼침 상태로 설정
            const initialExpanded = {};
            data.forEach(item => {
                if (item.code) initialExpanded[item.code] = true;
            });
            setExpanded(initialExpanded);
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
        setSelectedChildCode(null);
    };

    // --- Functions: Right Top (Form) ---
    const onInputChange = async (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));

        // viewPath 입력 시 module명 자동 추출
        if (key === 'viewPath' && value) {
            const extractedName = await getModuleNameFromPath(value);
            if (extractedName) setFormData(prev => ({ ...prev, module: extractedName }));
        }
    };

    const onNewForm = () => {
        // 현재 선택된 노드의 하위로 추가할지, 형제로 추가할지 결정이 필요하지만
        // 여기서는 '초기화' 개념으로 ROOT 레벨 혹은 완전 신규 입력 상태로 전환
        setSelectedNode(null);
        setFormData(initForm);
    };

    const onFormSave = async () => {
        // 유효성 검사
        if (!formData.name?.trim()) {
            alert('메뉴명을 입력해주세요.');
            return;
        }
        if (!formData.path?.trim() || !formData.path.startsWith('/')) {
            alert('URL 경로는 "/"로 시작하는 유효한 형식이어야 합니다. (예: /user-mng)');
            return;
        }
        if (formData.viewPath && !formData.module?.trim()) {
            alert('화면 경로(viewPath)가 입력된 경우, 컴포넌트 호출을 위한 모듈명(module)은 필수입니다.');
            return;
        }

        try {
            // 모듈명에 'module.' 접두사가 없으면 자동으로 추가
            const dataToSave = {
                ...formData,
                module: (formData.module && !formData.module.startsWith('module.'))
                    ? `module.${formData.module}`
                    : formData.module,
                // viewPath를 ./sys/Name 형식으로 정규화 (pages/ 제거)
                viewPath: formData.viewPath 
                    ? (formData.viewPath.startsWith('./') ? formData.viewPath : `./${formData.viewPath.replace(/^\//, '')}`).replace('./pages/', './')
                    : ''
            };

            // 체크 시에는 다시 ./pages/를 붙여서 확인
            const checkPath = dataToSave.viewPath.replace('./', './pages/');
            if (dataToSave.viewPath && !checkFileExists(checkPath)) {
                alert(`입력하신 화면 경로에 해당하는 파일이 존재하지 않습니다: ${formData.viewPath}\n(src/pages 하위 경로와 .jsx 확장자를 확인해주세요)`);
                return;
            }

            const isNew = !menus.find(m => m.code === dataToSave.code);
            if(isNew){
                await axios.post(`${API_BASE_URL}/menu/insert`, dataToSave);
            }else {
                await axios.put(`${API_BASE_URL}/menu/update`, dataToSave);
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
            code: null, // 선택을 위한 임시 유니크 키
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
        const deletes = childNodes.filter(row => row.status === 'D');

        // 유효성 검사 (추가되거나 수정된 행 대상)
        const itemsToValidate = [...inserts, ...updates];
        for (const row of itemsToValidate) {
            if (!row.name?.trim()) {
                alert('하위 메뉴의 모든 명칭을 입력해주세요.');
                return;
            }
            if (!row.path?.trim() || !row.path.startsWith('/')) {
                alert(`[${row.name || '신규'}] 메뉴의 경로는 "/"로 시작해야 합니다.`);
                return;
            }
            
            // 폼 저장과 동일한 방식으로 경로 정규화 및 존재 여부 체크
            const normalizedViewPath = row.viewPath 
                ? (row.viewPath.startsWith('./') ? row.viewPath : `./${row.viewPath.replace(/^\//, '')}`).replace('./pages/', './')
                : '';
            
            const checkPath = normalizedViewPath.replace('./', './pages/');
            if (normalizedViewPath && !checkFileExists(checkPath)) {
                alert(`[${row.name}] 입력하신 화면 경로에 해당하는 파일이 존재하지 않습니다: ${row.viewPath}\n(src/pages 하위 경로와 .jsx 확장자를 확인해주세요)`);
                return;
            }
        }

        // 저장 전 데이터 가공 (모듈명 접두사 및 경로 형식 통일)
        const processRow = (row) => ({
            ...row,
            module: (row.module && !row.module.startsWith('module.'))
                ? `module.${row.module}`
                : row.module,
            viewPath: row.viewPath 
                ? (row.viewPath.startsWith('./') ? row.viewPath : `./${row.viewPath.replace(/^\//, '')}`).replace('./pages/', './')
                : ''
        });

        const processedInserts = inserts.map(processRow);
        const processedUpdates = updates.map(processRow);

        if (processedInserts.length === 0 && processedUpdates.length === 0 && deletes.length === 0) {
            alert('변경사항이 없습니다.');
            return;
        }

        try {
            // 일괄 저장 API 호출
            await axios.post(`${API_BASE_URL}/menu/save`, { 
                inserts: processedInserts, 
                updates: processedUpdates, 
                deletes 
            });
            alert('하위 메뉴가 저장되었습니다.');
            //loadMenus(); // 전체 데이터 갱신
            window.location.reload();
        } catch (error) {
            console.error('그리드 저장 오류:', error);
            alert('저장 실패');
        }
    };

    const deleteGridRow = async () => {
        if (!selectedChildCode) {
            alert('삭제할 행을 선택해주세요.');
            return;
        }

        const rowToDelete = childNodes.find(row => row.code === selectedChildCode);
        if (!rowToDelete) return;

        // 신규 추가된 행인 경우 (아직 DB에 저장되지 않음)
        if (rowToDelete.status === 'I') {
            if (window.confirm('선택한 행을 목록에서 제거하시겠습니까?')) {
                setChildNodes(prev => prev.filter(row => row.code !== selectedChildCode));
                setSelectedChildCode(null);
            }
            return;
        }

        // 기존 행인 경우 서버에 즉시 삭제 요청
        if (window.confirm(`[${rowToDelete.name}] 메뉴를 삭제하시겠습니까? 이 작업은 즉시 서버에 반영됩니다.`)) {
            try {
                await axios.post(`${API_BASE_URL}/menu/delete`, { code: rowToDelete.code });
                alert('삭제되었습니다.');
                loadMenus(); // 전체 데이터 갱신
                setSelectedChildCode(null);
            } catch (error) {
                console.error('그리드 삭제 오류:', error);
                alert('삭제 실패');
            }
        }
    };

    // --- Columns Definition ---
    const gridColumns = useMemo(() => [
        { 
            accessorKey: 'code', 
            header: '메뉴코드', 
            size: 1, 
            cell: ({ getValue }) => <span className="text-slate-400 font-medium">{getValue() || '자동 생성'}</span>
        },
        { accessorKey: 'name', header: '메뉴명', size: 1.5, cell: (props) => Text(props) },
        { accessorKey: 'path', header: '경로(URL)', size: 1.5, cell: (props) => Text(props) },
        { 
            accessorKey: 'viewPath', 
            header: '화면경로', 
            size: 2, 
            cell: ({ getValue, row, column, table }) => {
                const onChange = async (e) => {
                    const val = e.target.value;
                    // 1. 화면경로 셀 업데이트
                    table.options.meta?.updateData(row.index, column.id, val);
                    
                    // 2. 경로 선택 시 모듈명 자동 추출 및 입력
                    if (val) {
                        const moduleName = await getModuleNameFromPath(val);
                        if (moduleName) {
                            // 동일한 행의 'module' 컬럼 값을 자동으로 업데이트
                            table.options.meta?.updateData(row.index, 'module', moduleName);
                        }
                    }
                };
                return (
                    <div className="relative group">
                        <input
                            className="w-full h-7 bg-transparent outline-none px-1 text-xs focus:bg-white focus:ring-1 focus:ring-blue-400 rounded transition-all"
                            value={getValue() || ''}
                            onChange={onChange}
                            list="viewPath-suggestions"
                            placeholder="./pages/..."
                        />
                    </div>
                );
            }
        },
        { accessorKey: 'module', header: '모듈명', size: 1.5, cell: (props) => Text(props) },
        { accessorKey: 'order', header: '정렬', size: 0.5, cell: (props) => Text(props) },
        { accessorKey: 'useYn', header: '사용', size: 0.5, cell: (props) => Check(props) },
        { accessorKey: 'popupYn', header: '팝업', size: 0.5, cell: (props) => Check(props) },
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
                <CardTitle className="text-lg">메뉴 관리</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-6" onClick={loadMenus}>새로고침</Button>
                </div>
            </div>

            <div className="flex flex-1 gap-4 min-h-0">
                {/* --- Left: Menu Tree --- */}
                <Card className="w-1/3 flex flex-col h-full">
                    <CardHeader className="py-3 px-4 border-b bg-slate-50">
                        <CardTitle className="text-sm font-semibold">메뉴 구조</CardTitle>
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
                            <CardTitle className="text-sm font-semibold">메뉴 상세 정보</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-8 px-6" onClick={onNewForm}>신규(초기화)</Button>
                                <Button variant="default" size="sm" className="h-8 px-6" onClick={onFormSave}>저장</Button>
                                <Button variant="destructive" size="sm" className="h-8 px-6" onClick={onFormDelete}>삭제</Button>
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
                                        placeholder="자동 생성"
                                        disabled
                                        className="bg-slate-50"
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
                                    <Label className="mb-1">화면 경로 (viewPath)</Label>
                                    <Input 
                                        value={formData.viewPath} 
                                        onChange={(e) => onInputChange('viewPath', e.target.value)} 
                                        placeholder="예: sys/UserManagement.jsx"
                                        list="viewPath-suggestions"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1">모듈명 (module)</Label>
                                    <Input 
                                        value={formData.module} 
                                        onChange={(e) => onInputChange('module', e.target.value)} 
                                        placeholder="컴포넌트 Export명"
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
                                <div>
                                    <Label className="mb-1">새 창 열기 (팝업)</Label>
                                    <RadioGroup 
                                        value={formData.popupYn || "N"} 
                                        onValueChange={(val) => onInputChange('popupYn', val)}
                                        className="flex gap-4 mt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Y" id="popup_y" />
                                            <Label htmlFor="popup_y">Y</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="N" id="popup_n" />
                                            <Label htmlFor="popup_n">N</Label>
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
                            <CardTitle className="text-sm font-semibold">하위 메뉴 목록</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-8 px-6" onClick={addGridRow}>행추가</Button>
                                <Button variant="outline" size="sm" className="h-8 px-6" onClick={deleteGridRow}>행삭제</Button>
                                <Button variant="default" size="sm" className="h-8 px-6" onClick={saveGrid}>목록 저장</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden">
                            <div className="h-full overflow-y-auto">
                                <GridTable 
                                    columns={gridColumns} 
                                    data={childNodes} 
                                    setData={setChildNodes}
                                    onRowClick={(row) => setSelectedChildCode(row.code)}
                                    selectedRowId={selectedChildCode}
                                    rowKey="code"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    )}
                </div>
            </div>
            {/* Autocomplete를 위한 공통 datalist (상단 폼 및 하단 그리드 공용) */}
            <datalist id="viewPath-suggestions">
                {pathSuggestions.map(path => (
                    <option key={path} value={path} />
                ))}
            </datalist>
        </main>
    )
}