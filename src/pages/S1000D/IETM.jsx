import React, { useState, useEffect } from 'react';

const IETM = ({ dataModuleId }) => {
  const [loading, setLoading] = useState(false);

  // 모듈 ID가 변경될 때마다 데이터 로딩 시뮬레이션
  useEffect(() => {
    if (dataModuleId) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [dataModuleId]);

  return (    
    <div className={`transition-all duration-300 ${loading ? 'opacity-30 translate-y-2' : 'opacity-100 translate-y-0'}`}>
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">IETM Viewer Content</h2>
        {loading && <div className="text-xs text-blue-500 animate-pulse font-bold">LOADING DATA...</div>}
      </div>
      
      {dataModuleId ? (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
            <p className="text-sm font-semibold text-blue-600 mb-1">Current Focus:</p>
            <p className="text-lg font-mono">{dataModuleId}</p>
          </div>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600">이 영역은 S1000D 데이터 모듈의 실제 XML 내용이 렌더링되는 곳입니다.</p>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
              [XML CONTENT RENDERER PLACEHOLDER]
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <p>좌측 트리에서 조회할 PM 또는 DM을 선택해 주세요.</p>
        </div>
      )}
    </div>
  );
}

export default IETM;