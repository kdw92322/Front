import React, { useState } from 'react'
import { NavLink } from 'react-router-dom';
import { FaUsers, FaKey, FaThList, FaChevronDown, FaChevronRight } from 'react-icons/fa'

export function Aside() {
  const menuGroups = [
    {
      title: '시스템 관리',
      items: [
        { name: '사용자 관리', path: '/users' },
        { name: '권한 관리', path: '/auth' },
        { name: '메뉴 관리', path: '/menu' },
        { name: '코드그룹 관리', path: '/codeGroup' },
        { name: '코드 관리', path: '/code' },
        // { name: '링크 관리', path: '/link' },
        // { name: '용어/약어 관리', path: '/terms' },
      ],
    },
    // 나중에 다른 그룹을 여기에 추가 가능 (예: 게시판 관리 등)
    {
      title: '게시판 관리',
      items: [
        { name: '게시판 관리', path: '/boardMng' },
      ],
    },
  ];

  const [openGroups, setOpenGroups] = useState({ 0: true });

  const toggleGroup = (index) => {
    setOpenGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col h-full shrink-0 overflow-y-auto">
      {/*         
      <div className="p-6 text-xl font-bold border-b border-slate-700">
        Admin System
      </div> 
      */}

      <nav className="flex-1 p-4">
        {menuGroups.map((group, index) => (
          <div key={index} className="mb-4">
            {/* 상위 메뉴 (클릭 시 토글) */}
            <button
              onClick={() => toggleGroup(index)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
            >
              <span>{group.title}</span>
              <span className={`text-[10px] transition-transform duration-200 ${openGroups[index] ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>

            {/* 하위 메뉴 리스트 (상태에 따라 표시) */}
            <ul className={`mt-1 space-y-1 transition-all duration-500 ease-in-out overflow-hidden ${
              openGroups[index] 
                ? 'max-h-[1000px] opacity-100' // 열렸을 때: 충분히 큰 값을 주어 내용만큼 늘어나게 함
                : 'max-h-0 opacity-0'          // 닫혔을 때: 높이 0으로 숨김
            }`}>
              {group.items.map((item) => (
                <li key={item.path}>
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
