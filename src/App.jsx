import React, { useState, useEffect, Suspense } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Layout from '@/components/layout/Layout.jsx'
import ProtectedRoute from '@/components/layout/ProtectedRoute.jsx'
import { API_BASE_URL } from '@/lib/config'
import IETMLayout from '@/components/layout/IETMLayout.jsx'
import axios from './lib/axios'
import { getToken, getUserRole } from '@/lib/auth'


// 1. Vite의 import.meta.glob을 사용하여 src/pages 하위의 모든 jsx 파일을 가져옴

// 메인 페이지는 별도로 정의 (Fallback 또는 정적 참조용)

export default function App() {
  // 토큰 자체를 상태로 관리하거나, 단순 체크용 상태를 둡니다.
  const [token, setToken] = useState(getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
    const syncToken = () => setToken(getToken());
    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* 1. 최상위에서 루트 경로(/) 처리: 토큰 여부에 따라 즉시 리다이렉트 */}
        <Route path="/" element={<Navigate to={token ? "/main" : "/login"} replace />} />

        {/* 모든 인증된 경로는 Layout으로 위임 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<Layout />} />
          {/* IETM 전용 팝업 레이아웃 (Header/Aside 없는 독립창) */}
          <Route path="/ietm-viewer" element={<IETMLayout />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
      </Routes>
      {/* 알림창이 표시될 컨테이너를 하나만 배치합니다 */}
      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        limit={1} // 동시에 여러 개 뜨는 것 방지
      />
    </Router>
  )
}
