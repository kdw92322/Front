import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import IETM from '@/pages/S1000D/IETM.jsx'; // IETM 컴포넌트 임포트
import axios from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';
import { FaFolder, FaFolderOpen, FaFileAlt, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { XMLParser } from 'fast-xml-parser';

const IETMLayout = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const contentPath = searchParams.get('contentPath'); // e.g., /ietm or /ietm/dm-001

  // 선택된 모듈 ID를 상태로 관리
  const [selectedModuleId, setSelectedModuleId] = useState(contentPath);
  // 선택된 모듈의 XML 컨텐츠 상태
  const [selectedModuleContent, setSelectedModuleContent] = useState(null);
  // 선택된 모듈의 메타데이터 상태
  const [selectedModuleMetadata, setSelectedModuleMetadata] = useState(null);

  // 실제 Data Modules 리스트 상태
  const [dataModules, setDataModules] = useState([]);
  // PMC 목록 및 트리 상태
  const [pmcList, setPmcList] = useState([]);
  const [csdbList, setCsdbList] = useState([]);
  const [selectedCsdb, setSelectedCsdb] = useState('');
  const [selectedPmc, setSelectedPmc] = useState('');
  const [publicationModules, setPublicationModules] = useState([]);
  // 트리 확장 상태 관리
  const [expandedPMs, setExpandedPMs] = useState({});
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  // 스플릿터 상태 관리
  const [sidebarWidth, setSidebarWidth] = useState(300); // 초기 너비 300px
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      // 최소 200px, 최대 600px 범위 내에서 조절 가능
      const newWidth = Math.max(200, Math.min(e.clientX, 600));
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // CSDB 선택 시 해당 CSDB에 속한 PMC 목록만 조회 (필터링)
  useEffect(() => {
    const fetchPmcList = async () => {
      if (!selectedCsdb) {
        setPmcList([]);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/s1000d/pmc/select`, {
          params: { csdbName: selectedCsdb }
        });
        setPmcList(response.data || []);
      } catch (error) {
        console.error("PMC 목록을 가져오는 중 오류가 발생했습니다.", error);
      }
    };
    fetchPmcList();
  }, [selectedCsdb]);

  // CSDB 목록 조회
  useEffect(() => {
    const fetchCsdbList = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/s1000d/csdb/select`);
        setCsdbList(response.data || []);
        console.log("CSDB 목록 조회 성공:", response.data);
      } catch (error) {
        console.error("CSDB 목록을 가져오는 중 오류가 발생했습니다.", error);
      }
    };
    fetchCsdbList();
  }, []);

  // 초기 로드 시 URL 파라미터가 있으면 상태 업데이트
  useEffect(() => {
    if (contentPath) {
      setSelectedModuleId(contentPath);
    }
  }, [contentPath]);

  // CSDB 선택 변경 시 PMC 선택 및 트리 초기화
  const handleCsdbChange = (csdbName) => {
    setSelectedCsdb(csdbName);
    // CSDB가 변경되면 PMC 선택 및 PM 트리 초기화
    setSelectedPmc('');
    setPublicationModules([]);
    setExpandedPMs({});
    // 현재 표시 중인 모듈도 초기화
    setSelectedModuleId(null);
    setSelectedModuleContent(null);
    setSelectedModuleMetadata(null);
  };

  const handleModuleSelect = async (id) => {
    setSelectedModuleId(id);
    
    // DMC 형식의 ID일 경우에만 서버에서 상세 데이터를 조회합니다.
    if (id && id.startsWith('DMC')) {
      setContentLoading(true);
      setSelectedModuleContent(null); // 새로운 데이터 로드 전 초기화
      setSelectedModuleMetadata(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/s1000d/dm/select`, {
          params: { id: id }
        });

        const xmlContent = response.data.xmlContent || {};
        if (xmlContent.bodyXml) {
          setSelectedModuleContent(xmlContent.bodyXml);
          setSelectedModuleMetadata(xmlContent.metadata || null);
        }
      } catch (error) {
        console.error("DM 데이터를 가져오는 중 오류가 발생했습니다.", error);
        setSelectedModuleContent("<error>데이터를 불러오는 데 실패했습니다.</error>");
      } finally {
        setContentLoading(false);
      }
    } else {
      setSelectedModuleContent(null);
    }
  };

  // S1000D PM XML(이스케이프된 문자열)을 트리 JSON 구조로 변환하는 유틸리티
  const parsePMToTree = (xmlStr) => {
    try {
      // 1. &lt; 형태의 엔티티를 실제 < 문자로 디코딩
      const textarea = document.createElement('textarea');
      textarea.innerHTML = xmlStr;
      const decodedXml = textarea.value;

      // 2. XML Parser 설정 (속성 및 텍스트 노드 포함)
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        removeNSPrefix: true, // pm:pmEntry -> pmEntry 로 접두사 제거
        trimValues: true,
        // pmEntry와 dmRef는 항상 배열로 처리하여 로직 단순화
        isArray: (name) => ["pmEntry", "dmRef"].includes(name),
      });

      const result = parser.parse(decodedXml);
      
      // 3. S1000D PM 구조 (content -> pmEntry) 탐색
      const content = result.pmc?.content || result.content || result;
      if (!content || !content.pmEntry) return [];

      // 4. dmRef를 트리 노드로 매핑하는 함수 (DMC 생성 로직 포함)
      const mapDmRef = (dmRef) => {
        if (!dmRef) return null;
        const code = dmRef.dmRefIdent?.dmCode;
        if (!code) return null;
        
        // S1000D 표준 DMC 형식으로 문자열 조립
        // 예: DMC-S1000D-A-00-00-00-01A-040A-D
        const dmc = [
          'DMC',
          code['@_modelIdentCode'],
          code['@_systemDiffCode'],
          code['@_systemCode'],
          (code['@_subSystemCode'] || '') + (code['@_subSubSystemCode'] || ''),
          code['@_assyCode'],
          (code['@_disassyCode'] || '') + (code['@_disassyCodeVariant'] || ''),
          (code['@_infoCode'] || '') + (code['@_infoCodeVariant'] || ''),
          code['@_itemLocationCode']
        ].filter(v => v !== undefined && v !== '').join('-');

        return {
          id: dmc,
          name: dmc,
          children: []
        };
      };

      // 5. pmEntry를 트리 노드로 매핑하는 재귀 함수
      const mapEntry = (entry) => {
        if (!entry) return null;
        
        const name = typeof entry.pmEntryTitle === 'object' ? (entry.pmEntryTitle['#text'] || "Section") : (entry.pmEntryTitle || "Section");

        const node = {
          id: entry["@_id"] || Math.random().toString(36).substr(2, 9),
          name: name,
          children: []
        };

        // 하위 pmEntry (중첩 섹션) 처리
        if (entry.pmEntry) {
          node.children.push(...entry.pmEntry.map(mapEntry).filter(Boolean));
        }

        // 하위 dmRef (실제 데이터 모듈) 처리
        if (entry.dmRef) {
          node.children.push(...entry.dmRef.map(mapDmRef).filter(Boolean));
        }
        
        return node;
      };

      const rootEntries = Array.isArray(content.pmEntry) ? content.pmEntry : [content.pmEntry];
      return rootEntries.map(mapEntry).filter(Boolean);
    } catch (err) {
      console.error("PM XML 파싱 중 오류 발생:", err);
      return [];
    }
  };

  // PMC 선택 변경 시 트리 데이터를 API로 조회하는 핸들러
  const handlePmcChange = async (e) => {
    const pmcId = e.target.value;
    setSelectedPmc(pmcId);

    // 기존 데이터 초기화 (신규 조회 시 꼬임 방지)
    setPublicationModules([]);
    setDataModules([]);
    setSelectedModuleId(null);
    setExpandedPMs({});

    if (pmcId) {
      setLoading(true);
      try {
        // API를 통해 선택된 PMC에 해당하는 Tree JSON 조회
        const response = await axios.get(`${API_BASE_URL}/s1000d/pmc/tree`, {
          params: { id: pmcId }
        });
        
        // 서버로부터 받은 트리 구조 데이터를 상태에 반영
        const data = response.data;
        const xmlContent = data.xmlContent; // API 응답 구조에 따라 조정

        const dmcId = xmlContent.dmc;
        const bodyXml = xmlContent.bodyXml;
        const metaData = xmlContent.metadata || {};
        //console.log(`PMC [${pmcId}] 트리 데이터 조회 성공:`, { bodyXml, dmcId, metaData });

        let treeData = [];
        if (bodyXml) {
          // 이스케이프된 XML 문자열 처리 및 트리 변환
          treeData = parsePMToTree(bodyXml);
        } 

        setPublicationModules(treeData);

        //console.log(`PMC [${pmcId}] 트리 데이터 로드 완료:`, treeData);
      } catch (error) {
        console.error("Tree 데이터 조회 중 오류 발생:", error);
        alert("트리 구조를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    } else {
      console.log("선택된 PMC가 없습니다.");
    }
  };

  const togglePM = (id, e) => {
    e.stopPropagation();
    setExpandedPMs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // PM 트리를 재귀적으로 렌더링하는 함수
  const renderPMTree = (nodes) => {
    return (
      <ul className="space-y-1 ml-2">
        {nodes.map((node) => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = expandedPMs[node.id];
          const isSelected = selectedModuleId === node.id;

          return (
            <li key={node.id} className="select-none">
              <div 
                onClick={() => handleModuleSelect(node.id)}
                className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors text-sm ${isSelected ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-slate-200 text-slate-700'}`}
              >
                <span onClick={(e) => hasChildren && togglePM(node.id, e)} className="text-[10px] text-slate-400 w-3">
                  {hasChildren ? (isExpanded ? <FaChevronDown /> : <FaChevronRight />) : null}
                </span>
                <span className={isSelected ? 'text-blue-600' : 'text-amber-500'}>
                  {hasChildren ? (isExpanded ? <FaFolderOpen /> : <FaFolder />) : <FaFileAlt className="text-slate-400" />}
                </span>
                <span className="truncate" title={node.name}>{node.name}</span>
              </div>
              {hasChildren && isExpanded && <div className="ml-2 border-l border-slate-300">{renderPMTree(node.children)}</div>}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={`flex h-screen bg-white overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      {/* Left: PM/DM Tree */}
      <div 
        className="bg-slate-50 border-r border-slate-200 flex flex-col shadow-inner shrink-0"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="p-4 border-b bg-slate-800 text-white space-y-3">
          <h3 className="text-lg font-bold tracking-tight">IETM Explorer</h3>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CSDB Selection</label>
            <select 
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              value={selectedCsdb} // 현재 선택된 CSDB 값
              onChange={(e) => handleCsdbChange(e.target.value)} // 새로운 핸들러 호출
            >
              <option value="">CSDB 목록을 선택하세요</option>
              {csdbList.map((csdb) => (
                <option key={csdb.id} value={csdb.name}>{csdb.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PMC Selection</label>
            <select 
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              value={selectedPmc}
              onChange={handlePmcChange}
            >
              <option value="">PMC 목록을 선택하세요</option>
              {pmcList.map((pmc) => (
                <option key={pmc.dmcId} value={pmc.dmcId}>{pmc.dmcId}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Publication Modules</h4>
            {loading ? (
              <div className="flex items-center gap-2 px-2 text-xs text-blue-500 animate-pulse">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                트리 구조 데이터를 로드 중입니다...
              </div>
            ) : publicationModules && publicationModules.length > 0 ? (
              renderPMTree(publicationModules)
            ) : (
              <p className="text-xs text-slate-400 italic px-2">
                {selectedPmc ? "해당 PMC에 구성된 트리 데이터가 없습니다." : "PMC를 먼저 선택해 주세요."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Splitter Bar */}
      <div
        onMouseDown={startResizing}
        className={`w-1 group transition-colors cursor-col-resize flex items-center justify-center hover:bg-blue-400 ${isResizing ? 'bg-blue-600' : 'bg-slate-200'}`}
      >
        <div className="w-0.5 h-12 rounded-full bg-slate-400 group-hover:bg-white opacity-50" />
      </div>

      {/* Right: Contents */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 border-b bg-white flex items-center px-6 justify-between shrink-0">
          <span className="text-sm font-medium text-slate-500">Viewer Mode: Standard</span>
          <span className="text-xs text-slate-400 font-mono">ID: {selectedModuleId || 'N/A'}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <IETM 
            dataModuleId={selectedModuleId} 
            content={selectedModuleContent} 
            loading={contentLoading} 
            metadata={selectedModuleMetadata}
            onModuleSelect={handleModuleSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default IETMLayout;