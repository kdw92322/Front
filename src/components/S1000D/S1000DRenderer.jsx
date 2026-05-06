import React from 'react';
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaExternalLinkAlt, FaLink } from 'react-icons/fa';
import { API_BASE_URL } from '@/lib/config';

/**
 * S1000D XML 태그를 HTML5/React 컴포넌트로 변환하는 렌더러
 */
const S1000DRenderer = ({ xmlString }) => {
  if (!xmlString) return null;

  // 1. HTML 엔티티 디코딩 (서버에서 이스케이프되어 올 경우 대비)
  const decodeEntities = (str) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = str;
    return textArea.value;
  };

  // 2. XML 파싱
  const parser = new DOMParser();
  const decodedXml = xmlString.includes('&lt;') ? decodeEntities(xmlString) : xmlString;
  const xmlDoc = parser.parseFromString(decodedXml, "text/xml");

  // 3. 재귀적 노드 렌더링 함수
  const renderNode = (node, index, depth = 0) => {
    // 텍스트 노드 처리
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tagName = node.tagName.toLowerCase();
    const parentName = node.parentNode?.tagName?.toLowerCase() || '';
    const id = node.getAttribute('id');
    
    // 자식 노드들을 먼저 처리 (재귀)
    const children = Array.from(node.childNodes).map((child, i) => 
      renderNode(child, i, tagName === 'levelledpara' ? depth + 1 : depth)
    );

    const key = `${tagName}-${index}`;

    switch (tagName) {
      // [para]: 일반 문단
      case 'para':
        return <p key={key} id={id} className="text-slate-700 leading-8 mb-5 text-justify">{children}</p>;

      // [title]: 부모 깊이 또는 태그에 따라 h1~h4 분기
      case 'title':
        if (parentName === 'figure' || parentName === 'sheet' || parentName === 'table') {
          return <figcaption key={key} className="mt-4 text-sm font-bold text-slate-500 italic text-center uppercase tracking-widest leading-relaxed border-t border-slate-100 pt-3 w-full max-w-md">{children}</figcaption>;
        }

        if (parentName === 'description' || depth === 0) {
          return <h2 key={key} className="text-2xl font-extrabold text-slate-900 mb-6 border-b-2 border-slate-200 pb-2">{children}</h2>;
        } else if (depth === 1) {
          return <h3 key={key} className="text-xl font-bold text-slate-800 mb-4 flex items-center">{children}</h3>;
        } else if (depth === 2) {
          return <h4 key={key} className="text-lg font-semibold text-slate-700 mb-3">{children}</h4>;
        }
        return <h5 key={key} className="text-base font-bold text-slate-600 mb-2">{children}</h5>;

      // [emphasis]: 특정 단어 강조 (굵게 + 밑줄)
      case 'emphasis':
        return <span key={key} className="font-bold underline decoration-slate-300 underline-offset-2 mx-0.5">{children}</span>;

      // [warning]: 경고 (인명/장비 치명적 위험)
      case 'warning':
        return (
          <div key={key} className="my-6 border-l-4 border-red-600 bg-red-50 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-red-700 font-bold uppercase tracking-wider text-sm">
              <FaExclamationTriangle className="text-lg" />
              <span>Warning</span>
            </div>
            <div className="text-red-900 italic font-medium leading-relaxed">{children}</div>
          </div>
        );

      // [caution]: 주의 (장비 손상/오작동)
      case 'caution':
        return (
          <div key={key} className="my-6 border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold uppercase tracking-wider text-sm">
              <FaExclamationCircle className="text-lg" />
              <span>Caution</span>
            </div>
            <div className="text-amber-900 italic font-medium leading-relaxed">{children}</div>
          </div>
        );

      // [note]: 참고 (추가 팁/설명)
      case 'note':
        return (
          <div key={key} className="my-6 border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold uppercase tracking-wider text-sm">
              <FaInfoCircle className="text-lg" />
              <span>Note</span>
            </div>
            <div className="text-blue-900 italic font-medium leading-relaxed">{children}</div>
          </div>
        );

      // [dmRef]: 외부 데이터 모듈 하이퍼링크
      case 'dmref':
        const dmCode = node.querySelector('dmCode');
        let dmc = '';
        if (dmCode) {
          dmc = [
            'DMC',
            dmCode.getAttribute('modelIdentCode'),
            dmCode.getAttribute('systemDiffCode'),
            dmCode.getAttribute('systemCode'),
            (dmCode.getAttribute('subSystemCode') || '') + (dmCode.getAttribute('subSubSystemCode') || ''),
            dmCode.getAttribute('assyCode'),
            (dmCode.getAttribute('disassyCode') || '') + (dmCode.getAttribute('disassyCodeVariant') || ''),
            (dmCode.getAttribute('infoCode') || '') + (dmCode.getAttribute('infoCodeVariant') || ''),
            dmCode.getAttribute('itemLocationCode')
          ].filter(v => v !== null && v !== '').join('-');
        }
        
        return (
          <span 
            key={key} 
            data-dmc={dmc}
            className="inline-flex items-center gap-1 text-blue-600 font-bold border-b border-blue-200 hover:text-blue-800 hover:border-blue-800 cursor-pointer transition-all mx-1"
            title={`이동: ${dmc}`}
          >
            <FaExternalLinkAlt className="text-[10px]" />
            {children.length > 0 ? children : dmc}
          </span>
        );

      // [internalRef]: 동일 문서 내 이동 앵커
      case 'internalref':
        const refId = node.getAttribute('internalRefId') || node.getAttribute('target');
        return (
          <span 
            key={key} 
            data-ref-id={refId}
            className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 hover:bg-emerald-600 hover:text-white cursor-pointer transition-all mx-1 shadow-sm"
          >
            <FaLink className="text-[10px]" />
            {children}
          </span>
        );

      // [externalPubRef]: 외부 간행물/도면 참조
      case 'externalpubref':
        const pubTitle = node.querySelector('externalPubTitle')?.textContent;
        const pubNo = node.querySelector('externalPubNo')?.textContent;
        return (
          <div key={key} className="inline-block my-1 px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono text-slate-700">
            <span className="font-bold text-slate-500 mr-2">[REF]</span>
            <span className="font-bold uppercase">{pubTitle}</span>
            {pubNo && <span className="ml-2 text-slate-400">({pubNo})</span>}
          </div>
        );

      // [verbatim]: 정형화된 텍스트 영역 (pre)
      case 'verbatim':
        return (
          <pre key={key} className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm my-6 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
            {children}
          </pre>
        );

      // [figure]: 그림/도해 컨테이너
      case 'figure':
        return (
          <figure key={key} className="my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center overflow-hidden transition-all hover:shadow-md">
            <div id={id} className="absolute -mt-20" /> {/* 스크롤 오프셋용 보이지 않는 타겟 */}
            {children}
          </figure>
        );

      // [sheet]: 다중 시트 구분
      case 'sheet':
        return (
          <div key={key} className="w-full flex flex-col items-center gap-4 mb-6 last:mb-0">
            {children}
          </div>
        );

      // [graphic]: 실제 이미지 바인딩
      case 'graphic':
        const icn = node.getAttribute('infoEntityIdent') || node.getAttribute('boardno');
        const imgSrc = icn ? `${API_BASE_URL}/s1000d/image/${icn}` : '';
        
        return (
          <div key={key} className="relative group max-w-full">
            <img 
              src={imgSrc} 
              alt={icn || 'S1000D Illustration'} 
              className="max-w-full h-auto rounded-lg border border-slate-100 shadow-sm transition-transform duration-500 group-hover:scale-[1.01]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/800x600?text=ICN+Illustration+Not+Found';
              }}
            />
            {icn && (
              <div className="mt-3 text-[10px] text-slate-400 font-mono text-center uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                ICN: {icn}
              </div>
            )}
          </div>
        );

      // [table]: 테이블 컨테이너 (반응형 래퍼)
      case 'table':
        return (
          <div key={key} id={id} className="my-10 overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
            {children}
          </div>
        );

      // [tgroup]: 실제 HTML table 태그로 맵핑
      case 'tgroup':
        return (
          <table key={key} className="w-full border-collapse text-left">
            {children}
          </table>
        );

      // [thead]: 테이블 헤더 영역
      case 'thead':
        return (
          <thead key={key} className="bg-slate-50 border-b-2 border-slate-200">
            {children}
          </thead>
        );

      // [tbody]: 테이블 본문 영역
      case 'tbody':
        return (
          <tbody key={key} className="divide-y divide-slate-100">
            {children}
          </tbody>
        );

      // [row]: 테이블 행 (tr)
      case 'row':
        return (
          <tr key={key} className="hover:bg-slate-50/80 transition-colors">
            {children}
          </tr>
        );

      // [entry]: 테이블 셀 (td/th)
      case 'entry':
        const align = node.getAttribute('align') || 'left';
        const grandparentName = node.parentNode?.parentNode?.tagName?.toLowerCase() || '';
        const isHeaderCell = grandparentName === 'thead';
        const CellTag = isHeaderCell ? 'th' : 'td';
        
        return (
          <CellTag 
            key={key} 
            className={`p-4 text-sm border-r last:border-0 border-slate-200 ${isHeaderCell ? 'font-extrabold text-slate-800 uppercase tracking-tight' : 'text-slate-600'}`}
            style={{ textAlign: align }}
          >
            {children}
          </CellTag>
        );

      // [mainProcedure]: 절차서 최상위 컨테이너
      case 'mainprocedure':
        return (
          <div key={key} className="main-procedure my-8 space-y-4" style={{ counterReset: 'step1' }}>
            {children}
          </div>
        );

      // [step1]: 1단계 절차 (숫자 넘버링: 1, 2, 3...)
      case 'step1':
        return (
          <div 
            key={key} id={id}
            className="step-1 relative pl-10 mb-6 before:absolute before:left-0 before:top-0 before:content-[counter(step1)'.'] before:font-bold before:text-blue-600 before:text-lg"
            style={{ counterIncrement: 'step1', counterReset: 'step2' }}
          >
            {children}
          </div>
        );

      // [step2]: 2단계 절차 (알파벳 넘버링: a, b, c...)
      case 'step2':
        return (
          <div 
            key={key} id={id}
            className="step-2 relative pl-10 mt-4 mb-4 before:absolute before:left-0 before:top-0 before:content-[counter(step2,lower-alpha)'.'] before:font-semibold before:text-slate-500"
            style={{ counterIncrement: 'step2' }}
          >
            {children}
          </div>
        );

      // [randomList]: 순서 없는 목록 (Bulleted List)
      case 'randomlist':
        return (
          <ul key={key} className="list-disc list-outside ml-10 my-4 space-y-2 text-slate-700">
            {children}
          </ul>
        );

      // [listItem]: 리스트 아이템
      case 'listitem':
        // 부모가 randomList일 경우 li 태그로, 그 외엔 div로 유연하게 대응
        const isInsideList = parentName === 'randomlist' || parentName === 'sequentiallist';
        if (isInsideList) {
          return <li key={key} className="pl-2">{children}</li>;
        }
        return <div key={key} className="mb-2">{children}</div>;

      // 절차 내 텍스트 컨테이너 처리
      case 'step1para':
      case 'step2para':
        return <p key={key} className="text-slate-700 leading-relaxed inline-block w-full">{children}</p>;

      // 구조적 컨테이너 처리
      case 'warningandcautionpara':
      case 'notepara':
        return <p key={key} className="mb-2 last:mb-0">{children}</p>;

      case 'content': return <div key={key} className="ietm-content space-y-6">{children}</div>;
      case 'levelledpara': return <section key={key} id={id} className="levelled-para mb-8 pl-4 border-l-2 border-slate-100">{children}</section>;
      case 'description': return <div key={key} className="dm-description">{children}</div>;

      default:
        return <React.Fragment key={key}>{children}</React.Fragment>;
    }
  };

  return <div className="s1000d-render-context">{renderNode(xmlDoc.documentElement, 0)}</div>;
};

export default S1000DRenderer;