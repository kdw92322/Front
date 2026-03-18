import React from 'react'
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header'
import { Aside } from '@/components/layout/Aside'
import { useNavigate } from 'react-router-dom';
import { removeToken } from '@/lib/auth'
import { Footer } from '@/components/layout/Footer'

export function Layout() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  
  const handleLogout = () => {
      removeToken()
      navigate('/login')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* 1. 상단 헤더 */}
      <Header userId={userId} onLogout={handleLogout}/>

      <div className="flex flex-1 min-h-0">
        {/* 2. 왼쪽 사이드바 (고정) */}
        <Aside />

        {/* 3. 오른쪽 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-2">
          <div className="max-w-[1800px] mx-auto bg-white rounded-xl shadow-sm min-h-full p-2">

            <Outlet />
          </div>
        </main>
      </div>

      {/* 4. 하단 푸터 */}
      <Footer />
    </div>  
  );
};

export default Layout;