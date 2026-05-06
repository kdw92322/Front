import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { FaUsers, FaKey, FaThList, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import { getToken, getUserRole } from '@/lib/auth';

export function Aside({ allMenus }) {
  const [menuGroups, setMenuGroups] = useState([]);
  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    if (allMenus && allMenus.length > 0) {
      const userRole = getUserRole();
      const tree = buildMenuTree(allMenus, userRole);
      setMenuGroups(tree);
    }
  }, [allMenus]);

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // 윈도우 팝업창 열기 함수
  const openPopup = (path) => {
    const width = 1400; // 팝업 너비
    const height = 900; // 팝업 높이
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const windowFeatures = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no`;
    const windowName = 'IETMViewerPopup';

    let popup = null;
    if (path.startsWith('/ietm')) {
      popup = window.open(`/ietm-viewer?contentPath=${encodeURIComponent(path)}`, windowName, windowFeatures);
    } else {
      popup = window.open(path, windowName, windowFeatures);
    }

    if (popup) popup.focus();
  };

  const buildMenuTree = (flatMenus, userRole) => {
    // 0. 권한 및 사용 여부 필터링 (App.jsx와 로직 동기화)
    const filtered = flatMenus.filter(menu => {
      if (menu.useYn === 'N') return false;
      
      if (userRole === 'ROLE_ADMIN' || userRole === 'admin') return true;
      if (userRole === 'ROLE_USER') {
        return !menu.viewPath?.includes('sys/');
      }
      if (userRole === 'ROLE_GUEST') {
        return menu.path === '/main';
      }
      return true; 
    });

    // 1. Root 메뉴 (상위 메뉴) 필터링 및 정렬
    const roots = filtered
      .filter(m => m.parentcode === 'ROOT' || !m.parentcode)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    // 2. 각 Root 메뉴의 하위 메뉴 매핑
    return roots
      .map(root => {
      const children = filtered
        .filter(m => m.parentcode === root.code)
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

      const formatUrl = (p) => {
        if (!p || p === '#') return '#';
        if (p.startsWith('./')) return p.replace('./', '/');
        if (p.startsWith('/')) return p;
        return `/${p}`;
      };

      return {
        code: root.code,
        title: root.name,
        items: children.map(child => ({
          name: child.name,
          path: formatUrl(child.path),
          code: child.code,
          isPop: child.isPop
        }))
      };
      })
      // 하위 메뉴가 하나라도 있는 상위 메뉴만 반환 (Empty Parent 방지)
      .filter(group => group.items.length > 0);
  };

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col h-full shrink-0 overflow-y-auto">
      {/*         
      <div className="p-6 text-xl font-bold border-b border-slate-700">
        Admin System
      </div> 
      */}

      <nav className="flex-1 p-2">
        {menuGroups.map((group, groupIdx) => (
          <div key={group.code || groupIdx} className="mb-2">
            {/* 상위 메뉴 (클릭 시 토글) */}
            <button
              onClick={() => toggleGroup(group.code)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
            >
              <span>{group.title}</span>
              <span className={`text-[10px] transition-transform duration-200 ${openGroups[group.code] ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>

            {/* 하위 메뉴 리스트 (상태에 따라 표시) */}
            <ul className={`mt-1 space-y-1 transition-all duration-500 ease-in-out overflow-hidden ${
              openGroups[group.code] 
                ? 'max-h-[1000px] opacity-100' // 열렸을 때: 충분히 큰 값을 주어 내용만큼 늘어나게 함
                : 'max-h-0 opacity-0'          // 닫혔을 때: 높이 0으로 숨김
            }`}>
              {group.items.map((item, idx) => (
                <li key={item.code || idx}>
                  {item.isPop === 'Y' ? (
                    <button
                      type="button"
                      onClick={() => openPopup(item.path)}
                      className="w-full flex items-center pl-8 pr-4 py-1.5 rounded-md text-xs transition-all text-slate-400 hover:bg-slate-700 hover:text-white text-left"
                    >
                      <span className="mr-3 opacity-30 text-xs">•</span>
                      {item.name}
                    </button>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center pl-8 pr-4 py-1.5 rounded-md text-xs transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`
                      }
                    >
                      <span className="mr-3 opacity-30 text-xs">•</span>
                      {item.name}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
