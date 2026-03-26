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
import axios from './lib/axios'

// 1. Vite의 import.meta.glob을 사용하여 src/pages 하위의 모든 jsx 파일을 가져옴
const pages = import.meta.glob('./pages/**/*.jsx');

// 메인 페이지는 별도로 정의 (Fallback 또는 정적 참조용)
const MainComponent = React.lazy(() => import('./pages/Main.jsx'));

export default function App() {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole'); // 로그인 시 저장된 Role (예: ROLE_ADMIN)
  const [menuRoutes, setMenuRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!token || !userRole) {
        setIsLoading(false);
        return;
      }
      try {
        // 1. 서버에서 해당 권한(role_id)이 접근 가능한 메뉴만 조회하거나,
        // 2. 전체를 가져온 후 프론트엔드에서 하드코딩된 규칙으로 필터링합니다.
        const response = await axios.get(`${API_BASE_URL}/menu/select`, {
          params: { role_id: userRole } 
        });
        
        let menus = response.data || [];

        // [프론트엔드 보안 필터링 예시]
        // ROLE_ADMIN: 모든 메뉴 허용
        // ROLE_USER: 시스템 관리(sys/) 메뉴 제외
        // ROLE_GUEST: 메인 대시보드만 허용
        const filteredMenus = menus.filter(menu => {
          if (userRole === 'ROLE_ADMIN') return true;
          if (userRole === 'ROLE_USER') {
            return !menu.viewPath?.includes('sys/');
          }
          if (userRole === 'ROLE_GUEST') {
            return menu.path === '/main' || menu.path === '/image/MainA';
          }
          return false;
        });

        const validRoutes = filteredMenus
          .filter(menu => menu.useYn === 'Y' && menu.path)
          .map(menu => {
            // 2. API 데이터의 viewPath(파일경로)를 이용하여 동적 매핑
            // 예: viewPath = "./pages/sys/UserManagement.jsx", module = "UserManagement"
            
            // DB 경로가 정확하지 않을 수 있으므로 여러 패턴으로 시도
            // 1) 정확한 일치
            // 2) "./" 누락 시 추가
            // 3) "pages/" 경로 누락 시 추가 (예: sys/UserManagement.jsx)

            const importFn = pages[menu.viewPath] || 
                             pages[`./${menu.viewPath}`] || 
                             pages[`./pages/${menu.viewPath}`];
            if (!importFn) return null;

            return {
              path: menu.path,
              Component: React.lazy(async () => {
                const module = await importFn();
                // 3. module 값이 있으면 해당 Named Export를, 없으면 default를 반환
                const moduleName = menu.module;

                // 1. DB에 지정된 이름이 있고, 모듈에 존재하면 최우선 사용
                if (moduleName && module[moduleName]) {
                  return { default: module[moduleName] };
                }
                
                // 2. Default Export가 있으면 사용
                if (module.default) {
                  return { default: module.default };
                }

                // 3. [자동 탐색] Named Export 중 대문자로 시작하는(컴포넌트) 첫 번째 항목을 사용
                const keys = Object.keys(module);
                const firstComponent = keys.find(key => key[0] === key[0].toUpperCase() && typeof module[key] === 'function');
                if (firstComponent) {
                  return { default: module[firstComponent] };
                }

                // 컴포넌트를 찾을 수 없는 경우 에러 방지용 Fallback (앱이 멈추지 않도록 함)
                console.error(`[Route Error] Component not found in ${menu.viewPath}. Available exports: ${keys.join(', ')}`);
                return { default: () => <div className="text-red-500 p-4 font-bold">Failed to load component: {moduleName}</div> };
              })
            };
          })
          .filter(Boolean); // 매핑되지 않은 항목 제거

        setMenuRoutes(validRoutes);
      } catch (error) {
        console.error("Failed to load menu routes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutes();
  }, [token]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* 1. 메인 페이지는 API 데이터 유무와 상관없이 항상 접근 가능하도록 정적 라우트 등록 */}
            <Route 
              path="/main" 
              element={
                <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                  <MainComponent />
                </Suspense>
              } 
            />

            {/* API 기반 동적 라우팅 */}
            {menuRoutes.map((route) => {
              // /main은 위에서 이미 정의했으므로 중복 방지
              if (route.path === '/main') return null;
              
              // 동적으로 생성된 Component
              const Component = route.Component;

              return (
                <Route 
                  key={route.path} 
                  path={route.path} 
                  element={
                    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                      <Component />
                    </Suspense>
                  } 
                />
              );
            })}
            <Route path="/" element={<Navigate to={token ? "/main" : "/login"} replace />} />
            {/* 2. 정의되지 않은 경로로 접근 시 404 처리 (빈 화면 방지) */}
            <Route path="*" element={<div className="flex items-center justify-center h-full text-xl text-gray-500">페이지를 찾을 수 없습니다. (404)</div>} />
          </Route>
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
