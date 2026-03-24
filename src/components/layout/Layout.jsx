import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header'
import { Aside } from '@/components/layout/Aside'
import { useNavigate } from 'react-router-dom';
import { removeToken } from '@/lib/auth'
import { Footer } from '@/components/layout/Footer'
import axios from '@/lib/axios'
import { API_BASE_URL } from '@/lib/config'

export function Layout() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  
  const handleLogout = () => {
      removeToken()
      navigate('/login')
  }

  // [추가] 앱(레이아웃) 초기 로딩 시 서버에 요청을 보내 토큰 유효성 검증
  useEffect(() => {
    // 메뉴 조회 등 가벼운 API를 호출하여 토큰이 유효한지 확인합니다.
    // 만약 토큰이 만료되었다면 서버가 401을 반환하고,
    // axios.js의 인터셉터가 이를 감지하여 로그인 페이지로 이동시킵니다.
    axios.get(`${API_BASE_URL}/menu/select`)
         .catch(() => { /* 에러 처리는 인터셉터에 위임 */ });
  }, []);

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