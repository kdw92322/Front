import React, { useRef, useEffect } from 'react';
import { FaImage } from 'react-icons/fa';
import S1000DRenderer from '@/components/s1000d/S1000DRenderer';

const IETM = ({ dataModuleId, content, loading, metadata, onModuleSelect }) => {
  const contentRef = useRef(null);

  // 동적 참조(Internal/DM Ref) 클릭 핸들러 (이벤트 위임)
  useEffect(() => {
    const handleRefClick = (e) => {
      // 1. 내부 참조 처리 (스크롤)
      const target = e.target.closest('[data-ref-id]');
      if (target) {
        const refId = target.getAttribute('data-ref-id');
        const targetElement = contentRef.current?.querySelector(`[id="${refId}"]`);
        
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // 시각적 피드백 (잠시 강조)
          targetElement.classList.add('bg-yellow-50', 'transition-colors', 'duration-500');
          setTimeout(() => targetElement.classList.remove('bg-yellow-50'), 2000);
        }
        return;
      }

      // 2. 외부 DM 참조 처리 (데이터 로드)
      const dmTarget = e.target.closest('[data-dmc]');
      if (dmTarget && onModuleSelect) {
        onModuleSelect(dmTarget.getAttribute('data-dmc'));
      }
    };

    const el = contentRef.current;
    el?.addEventListener('click', handleRefClick);
    return () => el?.removeEventListener('click', handleRefClick);
  }, [content]);

  return (    
    <div className={`transition-all duration-300 ${loading ? 'opacity-30 translate-y-2' : 'opacity-100 translate-y-0'}`}>
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">IETM Viewer Content</h2>
        {loading && <div className="text-xs text-blue-500 animate-pulse font-bold">LOADING DATA...</div>}
      </div>
      
      {dataModuleId ? (
        <div className="grid grid-cols-2 gap-8 items-start">
          {/* 좌측: DM 텍스트 컨텐츠 영역 */}
          <div className="space-y-6 border-r border-slate-100 pr-8">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md shadow-sm">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Data Module Code</p>
                  <p className="text-sm font-mono font-bold text-slate-700">{dataModuleId}</p>
                </div>
                {metadata && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Technical Name / Info Name</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {metadata.techName} <span className="mx-1 text-slate-300">|</span> {metadata.infoName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Security: {metadata.security}</p>
                  </div>
                )}
              </div>
            </div>
            <div ref={contentRef} className="prose prose-slate max-w-none mt-6">
              {content ? (
                <S1000DRenderer 
                  xmlString={content} 
                />
              ) : (
                <p className="text-slate-400 italic">표시할 내용이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 우측: ICN 일러스트레이션 영역 (Sticky) */}
          <div className="sticky top-6">
            <div className="aspect-square w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 shadow-inner transition-all">
              <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                <FaImage className="text-4xl opacity-20 text-slate-600" />
              </div>
              <div className="text-center px-10">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">ICN Viewer</p>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  본문의 그림 참조(Figure Ref) 또는 멀티미디어 태그와 연관된 ICN 일러스트레이션이 이 영역에 표시됩니다.
                </p>
              </div>
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