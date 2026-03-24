import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { FaUsers, FaKey, FaThList, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import axios from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';

export function Aside() {
  const [menuGroups, setMenuGroups] = useState([]);
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/menu/select`);
        const data = response.data || [];
        
        // Flat Data를 Aside 메뉴 구조(Title -> Items)로 변환
        const tree = buildMenuTree(data);
        setMenuGroups(tree);

        // 초기 로딩 시 첫 번째 그룹 열기
        if (tree.length > 0) {
          setOpenGroups({ [tree[0].code]: true });
        }
      } catch (error) {
        console.error("메뉴 목록 로드 실패", error);
      }
    };

    fetchMenus();
  }, []);

  const buildMenuTree = (flatMenus) => {
    // 1. Root 메뉴 (상위 메뉴) 필터링 및 정렬
    const roots = flatMenus
      .filter(m => m.parentcode === 'ROOT' || !m.parentcode)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // 2. 각 Root 메뉴의 하위 메뉴 매핑
    return roots.map(root => {
      const children = flatMenus
        .filter(m => m.parentcode === root.code)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      return {
        code: root.code,
        title: root.name,
        items: children.map(child => ({
          name: child.name,
          path: child.path || '#', // URL이 없으면 # 처리
          code: child.code
        }))
      };
    });
  };

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col h-full shrink-0 overflow-y-auto">
      {/*         
      <div className="p-6 text-xl font-bold border-b border-slate-700">
        Admin System
      </div> 
      */}

      <nav className="flex-1 p-4">
        {menuGroups.map((group, groupIdx) => (
          <div key={group.code || groupIdx} className="mb-4">
            {/* 상위 메뉴 (클릭 시 토글) */}
            <button
              onClick={() => toggleGroup(group.code)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
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
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center pl-10 pr-4 py-2.5 rounded-md text-sm transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`
                    }
                  >
                    <span className="mr-3 opacity-30 text-xs">•</span>
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
