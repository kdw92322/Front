import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/Checkbox';
import { API_BASE_URL } from '@/lib/config';
import axios from '../../lib/axios';
import GridTable from '@/components/layout/GridTable';
import { getCodeDetails } from '../../lib/code';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';

export function MenuAuthManagement() {
    const [roles, setRoles] = useState([]);
    const [menus, setMenus] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [authMap, setAuthMap] = useState({});
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        const init = async () => {
            // 1. Role(권한 그룹) 목록 조회
            const roleData = await getCodeDetails('role');
            setRoles(roleData || []);

            // 2. 전체 메뉴 조회 및 트리 구성
            try {
                const menuResponse = await axios.get(`${API_BASE_URL}/menu/select`);
                const menuData = menuResponse.data || [];
                setMenus(menuData);
                setTreeData(buildTree(menuData, 'ROOT'));
                
                // 초기 로딩 시 트리 모두 펼치기
                const initialExpanded = {};
                menuData.forEach(m => { if (m.code) initialExpanded[m.code] = true; });
                setExpanded(initialExpanded);
            } catch (error) {
                console.error('메뉴 조회 실패:', error);
            }
        };
        init();
    }, []);

    // 권한 그룹 선택 시 해당 매핑 정보 조회
    useEffect(() => {
        if (selectedRoleId) {
            fetchAuthMapping(selectedRoleId);
        } else {
            setAuthMap({});
        }
    }, [selectedRoleId]);

    const fetchAuthMapping = async (roleId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/menuAuth/select`, { params: { roleId: roleId } });
            const mapping = {};

            response.data?.forEach(item => {
                mapping[item.menuCode] = {
                    useYn: item.useYn === 'Y',
                    rYn: item.rYn === 'Y',
                    cYn: item.cYn === 'Y',
                    dYn: item.dYn === 'Y'
                };
            });
            setAuthMap(mapping);
        } catch (error) {
            console.error('권한 매핑 조회 실패:', error);
        }
    };

    const buildTree = (items, parentId) => {
        return items
            .filter(item => item.parentcode === parentId || (!parentId && !item.parentcode))
            .map(item => ({
                ...item,
                children: buildTree(items, item.code)
            }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const handleAuthChange = (menuCode, key, checked) => {
        setAuthMap(prev => {
            const nextMap = { ...prev };

            // 하위 메뉴들의 권한을 재귀적으로 변경하는 함수 (체크/해제 공통)
            const updateRecursive = (parentCode, isChecked) => {
                menus.filter(m => m.parentcode === parentCode).forEach(child => {
                    nextMap[child.code] = {
                        useYn: isChecked,
                        rYn: isChecked,
                        cYn: isChecked,
                        dYn: isChecked
                    };
                    updateRecursive(child.code, isChecked);
                });
            };

            const currentAuth = nextMap[menuCode] || { useYn: false, rYn: false, cYn: false, dYn: false };
            let updatedAuth = { ...currentAuth, [key]: checked };

            // '접근(useYn)' 체크박스 클릭 시 나머지 CRUD 권한도 함께 토글
            if (key === 'useYn') {
                // 상위 메뉴 상태 변경 시 하위 메뉴들의 모든 권한도 재귀적으로 전파
                updateRecursive(menuCode, checked);

                updatedAuth = {
                    useYn: checked,
                    rYn: checked,
                    cYn: checked,
                    dYn: checked
                };
            } 
            // CRUD 권한 중 하나라도 체크되면 '접근(useYn)'도 자동으로 체크
            else if (checked === true && ['rYn', 'cYn', 'dYn'].includes(key)) {
                updatedAuth.useYn = true;
            }

            nextMap[menuCode] = updatedAuth;
            return nextMap;
        });
    };

    const onSave = async () => {
        if (!selectedRoleId) {
            alert('권한 그룹을 먼저 선택해주세요.');
            return;
        }

        const payload = Object.entries(authMap).map(([menuCode, auths]) => ({
            role_id: selectedRoleId,
            menu_code: menuCode,
            useYn: auths.useYn ? 'Y' : 'N',
            rYn: auths.rYn ? 'Y' : 'N',
            cYn: auths.cYn ? 'Y' : 'N',
            dYn: auths.dYn ? 'Y' : 'N'
        }));
        
        try {
            await axios.post(`${API_BASE_URL}/menuAuth/update`, { role_id: selectedRoleId, auths: payload });
            alert('권한 설정이 저장되었습니다.');
        } catch (error) {
            console.error('저장 오류:', error);
            alert('저장에 실패했습니다.');
        }
    };

    const roleColumns = [
        { accessorKey: 'dtlCd', header: 'ID', size: 1 },
        { accessorKey: 'dtlNm', header: '권한그룹명', size: 2 }
    ];

    const renderTreeNodes = (nodes, level = 0) => {
        return nodes.map(node => {
            const isExpanded = expanded[node.code];
            const hasChildren = node.children && node.children.length > 0;
            const auth = authMap[node.code] || { useYn: false, rYn: false, cYn: false, dYn: false };

            return (
                <React.Fragment key={node.code}>
                    <div className="flex items-center border-b hover:bg-slate-50 py-1.5 group transition-colors">
                        {/* 메뉴명/트리구조 영역 */}
                        <div className="flex-1 flex items-center min-w-0" style={{ paddingLeft: `${level * 20 + 8}px` }}>
                            <span 
                                className="mr-2 text-slate-400 cursor-pointer p-1 hover:bg-slate-200 rounded"
                                onClick={() => hasChildren && setExpanded(prev => ({ ...prev, [node.code]: !isExpanded }))}
                            >
                                {hasChildren ? (isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />) : <span className="w-[10px] inline-block"/>}
                            </span>
                            <span className="mr-2 text-yellow-500 shrink-0">
                                {hasChildren ? (isExpanded ? <FaFolderOpen /> : <FaFolder />) : <FaFile className="text-slate-400"/>}
                            </span>
                            <span className="text-sm truncate font-medium text-slate-700">{node.name}</span>
                        </div>

                        {/* 권한 체크박스 영역 (접근, R, C, U, D) */}
                        <div className="flex shrink-0 items-center justify-around w-[300px] gap-2">
                            <div className="w-12 flex justify-center"><Checkbox className="scale-90" checked={auth.useYn} onCheckedChange={(val) => handleAuthChange(node.code, 'useYn', val)} /></div>
                            <div className="w-10 flex justify-center"><Checkbox className="scale-90" checked={auth.rYn} onCheckedChange={(val) => handleAuthChange(node.code, 'rYn', val)} /></div>
                            <div className="w-10 flex justify-center"><Checkbox className="scale-90" checked={auth.cYn} onCheckedChange={(val) => handleAuthChange(node.code, 'cYn', val)} /></div>
                            <div className="w-10 flex justify-center"><Checkbox className="scale-90" checked={auth.dYn} onCheckedChange={(val) => handleAuthChange(node.code, 'dYn', val)} /></div>
                        </div>
                    </div>
                    {hasChildren && isExpanded && renderTreeNodes(node.children, level + 1)}
                </React.Fragment>
            );
        });
    };

    return (
        <main className="h-full flex flex-col p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <CardTitle className="text-lg">메뉴 권한 관리</CardTitle>
                <div className="flex gap-2">
                    <Button variant="default" size="sm" className="h-8 px-6" onClick={onSave}>저장</Button>
                </div>
            </div>

            <div className="flex flex-1 gap-4 min-h-0">
                {/* 왼쪽: 권한 그룹 리스트 */}
                <Card className="w-1/3 flex flex-col">
                    <CardHeader className="py-3 px-4 border-b bg-slate-50">
                        <CardTitle className="text-sm font-semibold">권한 그룹 목록</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto">
                            <GridTable 
                                columns={roleColumns} 
                                data={roles} 
                                onRowClick={(row) => setSelectedRoleId(row.dtlCd)}
                                selectedRowId={selectedRoleId}
                                rowKey="dtlCd"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 오른쪽: 메뉴 트리 및 권한 설정 */}
                <Card className="w-2/3 flex flex-col">
                    <CardHeader className="py-3 px-4 border-b bg-slate-50 flex flex-row justify-between items-center">
                        <CardTitle className="text-sm font-semibold">메뉴별 접근 권한 설정</CardTitle>
                        <span className="text-xs font-semibold text-blue-600">
                            {selectedRoleId ? `[${selectedRoleId}] 그룹 설정 중` : '그룹을 선택해 주세요'}
                        </span>
                    </CardHeader>
                    
                    {/* 컬럼 헤더 영역 */}
                    <div className="flex bg-slate-100 border-b py-2 px-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
                        <div className="flex-1 text-left pl-8">메뉴 명칭</div>
                        <div className="flex shrink-0 w-[300px] gap-2 justify-around">
                            <div className="w-12 text-center">접근</div>
                            <div className="w-10 text-center">R</div>
                            <div className="w-10 text-center">C</div>
                            <div className="w-10 text-center">D</div>
                        </div>
                    </div>

                    <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                        {selectedRoleId ? (
                            <div className="flex flex-col">
                                {renderTreeNodes(treeData)}
                                {treeData.length === 0 && (
                                    <div className="p-10 text-center text-slate-400">조회된 메뉴가 없습니다.</div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 italic">
                                왼쪽 리스트에서 권한 그룹을 선택하면 메뉴 트리 권한 설정이 활성화됩니다.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

export default MenuAuthManagement;