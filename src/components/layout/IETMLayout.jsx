import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import IETM from '@/pages/S1000D/IETM.jsx'; // IETM 컴포넌트 임포트

const IETMLayout = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const contentPath = searchParams.get('contentPath'); // e.g., /ietm or /ietm/dm-001

  // 선택된 모듈 ID를 상태로 관리
  const [selectedModuleId, setSelectedModuleId] = useState(contentPath);

  // 초기 로드 시 URL 파라미터가 있으면 상태 업데이트
  useEffect(() => {
    if (contentPath) {
      setSelectedModuleId(contentPath);
    }
  }, [contentPath]);

  const handleModuleSelect = (id) => {
    setSelectedModuleId(id);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left: PM/DM Tree (20%) - 2/10 Ratio */}
      <div className="w-1/5 bg-slate-50 border-r border-slate-200 flex flex-col shadow-inner">
        <div className="p-4 border-b bg-slate-800 text-white">
          <h3 className="text-lg font-bold">IETM Explorer</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Publication Modules</h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li 
                onClick={() => handleModuleSelect('PM-AIRCRAFT-MANUAL')}
                className={`flex items-center gap-2 cursor-pointer hover:text-blue-600 font-medium ${selectedModuleId === 'PM-AIRCRAFT-MANUAL' ? 'text-blue-600' : ''}`}
              >
                📂 [PM] Aircraft Manual
              </li>
              <li 
                onClick={() => handleModuleSelect('PM-ENGINE-MAINT')}
                className={`flex items-center gap-2 cursor-pointer hover:text-blue-600 font-medium pl-2 ${selectedModuleId === 'PM-ENGINE-MAINT' ? 'text-blue-600' : ''}`}
              >
                📂 [PM] Engine Maintenance
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Data Modules</h4>
            <ul className="space-y-1 text-xs text-slate-600 border-l border-slate-200 ml-1 pl-3">
              <li 
                onClick={() => handleModuleSelect('DMC-AIRCRAFT-01A-040A')}
                className={`py-1 hover:bg-slate-200 px-2 rounded cursor-pointer transition-colors ${selectedModuleId === 'DMC-AIRCRAFT-01A-040A' ? 'bg-blue-100 text-blue-600 font-bold' : ''}`}
              >
                📄 DMC-AIRCRAFT-01A-040A
              </li>
              <li 
                onClick={() => handleModuleSelect('DMC-ENGINE-02A-040A')}
                className={`py-1 hover:bg-slate-200 px-2 rounded cursor-pointer transition-colors ${selectedModuleId === 'DMC-ENGINE-02A-040A' ? 'bg-blue-100 text-blue-600 font-bold' : ''}`}
              >
                📄 DMC-ENGINE-02A-040A
              </li>
              <li 
                onClick={() => handleModuleSelect('DMC-FUEL-03A-040A')}
                className={`py-1 hover:bg-slate-200 px-2 rounded cursor-pointer transition-colors ${selectedModuleId === 'DMC-FUEL-03A-040A' ? 'bg-blue-100 text-blue-600 font-bold' : ''}`}
              >
                📄 DMC-FUEL-03A-040A
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right: Contents (80%) - 8/10 Ratio */}
      <div className="w-4/5 flex flex-col">
        <div className="h-12 border-b bg-white flex items-center px-6 justify-between shrink-0">
          <span className="text-sm font-medium text-slate-500">Viewer Mode: Standard</span>
          <span className="text-xs text-slate-400 font-mono">ID: {selectedModuleId || 'N/A'}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <IETM dataModuleId={selectedModuleId} />
        </div>
      </div>
    </div>
  );
};

export default IETMLayout;