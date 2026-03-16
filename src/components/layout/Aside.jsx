import React, { useState } from 'react'
import { NavLink } from 'react-router-dom';
import { FaUsers, FaKey, FaThList, FaChevronDown, FaChevronRight } from 'react-icons/fa'

export function Aside() {
  const menus = [
    { name: '사용자 관리', path: '/users' },
    { name: '권한 관리', path: '/auth' },
    { name: '메뉴 관리', path: '/menu' },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen p-4 flex flex-col">
      <nav className="flex-1">
        <ul className="space-y-2">
          {menus.map((menu) => (
            <li key={menu.path}>
              <NavLink
                to={menu.path}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-md transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white font-bold shadow-lg' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                {menu.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
