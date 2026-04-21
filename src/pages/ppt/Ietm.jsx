import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import axios from '../../lib/axios';
import { 
    IoLibraryOutline, 
    IoDocumentTextOutline, 
    IoSearchOutline, 
    IoInformationCircleOutline,
    IoPrintOutline,
    IoExpandOutline
} from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Ietm() {
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [moduleContent, setModuleContent] = useState(''); // 실제 콘텐츠 저장용
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // CSDB 모듈 목록 로드
    useEffect(() => {
        const fetchModules = async () => {
            try {
                setLoading(true);
                // 실제 백엔드 API 엔드포인트에 맞춰 수정 필요
                const url = `${API_BASE_URL}/s1000d/getList`;
                const filter = searchTerm ? { search: searchTerm } : {};
                
                const response = await axios.get(url, { params: filter });
                setModules(response.data || []);
            } catch (error) {
                console.error('CSDB 데이터를 불러오는데 실패했습니다:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);

    // 모듈 선택 시 콘텐츠 로드 (옵션: 리스트 조회 시 콘텐츠가 없다면 추가 호출 필요)
    const handleModuleClick = async (dm) => {
        setSelectedModule(dm);
        setModuleContent(''); // 초기화
        
        try {
            const response = await axios.get(`${API_BASE_URL}/s1000d/getContent`, { 
                params: { path: dm.filePath } 
            });

            // 백엔드에서 받은 XML 또는 변환된 HTML 내용을 상태에 저장
            setModuleContent(response.data.content || '콘텐츠가 비어 있습니다.');
        } catch (error) {
            console.error('콘텐츠 로드 오류:', error);
            setModuleContent('<p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>');
        }
    };

    // 검색 필터링된 모듈 목록
    const filteredModules = modules.filter(m => 
        m.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.docType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="flex h-full bg-slate-100 overflow-hidden">
            {/* 좌측 사이드바: 데이터 모듈 탐색기 */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
                <div className="p-4 border-b bg-slate-50/50">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <IoLibraryOutline className="text-blue-600" />
                        CSDB Explorer
                    </h2>
                    <div className="relative mt-3">
                        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input 
                            className="pl-9 h-9 text-sm bg-white" 
                            placeholder="파일명 또는 문서 타입 검색..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="p-4 text-center text-slate-400 text-sm italic">목록 로딩 중...</div>
                    ) : filteredModules.length > 0 ? (
                        <div className="space-y-1">
                            {filteredModules.map((dm) => (
                                <button
                                    key={dm.id}
                                    onClick={() => handleModuleClick(dm)}
                                    className={`w-full text-left p-3 rounded-md transition-all group ${
                                        selectedModule?.id === dm.id 
                                        ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                                        : 'hover:bg-slate-50 border border-transparent text-slate-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <IoDocumentTextOutline className={`flex-shrink-0 ${selectedModule?.id === dm.id ? 'text-blue-600' : 'text-slate-400'}`} />
                                        <div className="overflow-hidden">
                                            <p className={`text-[13px] font-medium truncate ${selectedModule?.id === dm.id ? 'text-blue-900' : 'text-slate-700'}`}>
                                                {dm.fileName}
                                            </p>
                                            <p className={`text-[11px] mt-0.5 ${selectedModule?.id === dm.id ? 'text-blue-600' : 'text-slate-400'}`}>
                                                {dm.docType} ({Math.round(dm.fileSize / 1024)} KB)
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">검색 결과가 없습니다.</div>
                    )}
                </div>
            </div>

            {/* 우측 메인: IETM 뷰어 */}
            <div className="flex-1 flex flex-col min-w-0">
                {selectedModule ? (
                    <>
                        {/* 뷰어 헤더 및 툴바 */}
                        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <h1 className="font-bold text-slate-800 truncate">{selectedModule.fileName}</h1>
                                <div className="flex gap-2">
                                    <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-semibold text-blue-600 rounded border border-blue-100 uppercase">{selectedModule.extension}</span>
                                    <span className="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-500 rounded border border-slate-200">{selectedModule.docType}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8"><IoPrintOutline /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8"><IoExpandOutline /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600"><IoInformationCircleOutline /></Button>
                            </div>
                        </div>

                        {/* 콘텐츠 렌더링 영역 */}
                        <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
                            <div className="max-w-4xl mx-auto shadow-sm border border-slate-200 p-10 bg-white min-h-full">
                                {/* S1000D 스타일의 헤더 섹션 */}
                                <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                                    <div className="text-2xl font-black uppercase tracking-tighter text-slate-900">Technical Manual</div>
                                    <div className="text-right text-[10px] font-mono text-slate-500">
                                        PATH: {selectedModule.filePath}<br />
                                        SIZE: {selectedModule.fileSize.toLocaleString()} bytes
                                    </div>
                                </div>

                                {/* 실제 데이터 모듈 내용 (HTML/XML 변환 데이터) */}
                                <article 
                                    className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700"
                                    dangerouslySetInnerHTML={{ __html: moduleContent }} 
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <IoLibraryOutline size={64} className="mb-4 opacity-20" />
                        <p>탐색기에서 열람할 데이터 모듈을 선택해 주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}