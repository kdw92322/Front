import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header'
import { Aside } from '@/components/layout/Aside'
import { removeToken } from '@/lib/auth'
import { Footer } from '@/components/layout/Footer'
import axios from '@/lib/axios'
import { API_BASE_URL } from '@/lib/config'
import { IoClose } from 'react-icons/io5';

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const userId = localStorage.getItem('userId')
  const [tabs, setTabs] = useState([{ path: '/main', name: '메인' }])
  const [allMenus, setAllMenus] = useState([])
  
  const handleLogout = () => {
      removeToken()
      navigate('/login')
  }

  useEffect(() => {
    axios.get(`${API_BASE_URL}/menu/select`)
         .then(res => setAllMenus(res.data || []))
         .catch(() => { });
  }, []);

  // 경로 변경 시 탭 추가 로직
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/login') return;
    
    const isExist = tabs.find(tab => tab.path === location.pathname);
    if (!isExist) {
      const formatUrl = (p) => {
        if (!p || p === '#') return '';
        if (p.startsWith('./')) return p.replace('./', '/');
        return p.startsWith('/') ? p : `/${p}`;
      };

      const menu = allMenus.find(m => {
        return formatUrl(m.path) === location.pathname;
      });
      
      if (menu) {
        setTabs(prev => [...prev, { path: formatUrl(menu.path), name: menu.name }]);
      } else if (location.pathname === '/main') {
        setTabs(prev => [...prev, { path: '/main', name: '메인' }]);
      }
    }
  }, [location.pathname, allMenus]);

  const closeTab = (e, path) => {
    e.stopPropagation();
    if (path === '/main') return; // 메인 탭은 닫기 방지(선택)

    const newTabs = tabs.filter(tab => tab.path !== path);
    setTabs(newTabs);

    // 만약 닫는 탭이 현재 활성화된 탭이라면 이전 탭으로 이동
    if (location.pathname === path) {
      const lastTab = newTabs[newTabs.length - 1];
      navigate(lastTab ? lastTab.path : '/main');
    }
  };

  // 모든 탭 닫기 (메인 제외)
  const closeAllTabs = () => {
    setTabs([{ path: '/main', name: '메인' }]);
    navigate('/main');
  };

  // 현재 활성화된 탭 제외하고 모두 닫기
  const closeOtherTabs = () => {
    const currentTab = tabs.find(tab => tab.path === location.pathname);
    if (currentTab && currentTab.path !== '/main') {
      setTabs([{ path: '/main', name: '메인' }, currentTab]);
    } else {
      // 현재 탭이 메인이면 전체 닫기와 동일
      setTabs([{ path: '/main', name: '메인' }]);
      navigate('/main');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* 1. 상단 헤더 */}
      <Header userId={userId} onLogout={handleLogout}/>

      <div className="flex flex-1 min-h-0">
        {/* 2. 왼쪽 사이드바 (고정) */}
        <Aside />

        {/* 3. 오른쪽 메인 콘텐츠 영역 */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-100">
          {/* 탭 바 영역 */}
          <div className="flex bg-slate-200 border-b border-slate-300 items-center justify-between">
            {/* 탭 목록 */}
            <div className="flex px-2 pt-2 gap-1 overflow-x-auto scrollbar-hide flex-1">
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                  <div
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={`
                      flex items-center gap-2 px-4 py-1.5 rounded-t-lg cursor-pointer transition-all duration-200
                      text-xs font-medium border-t border-x
                      ${isActive 
                        ? 'bg-white border-slate-300 text-blue-600 shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)]' 
                        : 'bg-slate-300/50 border-transparent text-slate-500 hover:bg-slate-300'}
                    `}
                  >
                    <span className="whitespace-nowrap">{tab.name}</span>
                    {tab.path !== '/main' && (
                      <IoClose 
                        className={`hover:bg-slate-400/50 rounded-full p-0.5 text-sm transition-colors ${isActive ? 'text-slate-400' : 'text-slate-500'}`}
                        onClick={(e) => closeTab(e, tab.path)}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 탭 관리 액션 버튼 */}
            <div className="flex items-center gap-1 px-2 pt-1">
              <button 
                onClick={closeOtherTabs}
                className="px-2 py-1 hover:bg-slate-300 rounded text-[10px] text-slate-500 font-semibold transition-colors whitespace-nowrap"
              >
                다른 탭 닫기
              </button>
              <button 
                onClick={closeAllTabs}
                className="px-2 py-1 hover:bg-slate-300 rounded text-[10px] text-slate-500 font-semibold transition-colors whitespace-nowrap"
              >
                전체 닫기
              </button>
            </div>
          </div>

          {/* 실제 컨텐츠 영역 */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="max-w-[1800px] mx-auto bg-white rounded-b-xl rounded-tr-xl shadow-sm min-h-full p-2">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* 4. 하단 푸터 */}
      <Footer />
    </div>  
  );
};

export default Layout;