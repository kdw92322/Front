import * as React from 'react';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export function ProtectedRoute() {
  const token = localStorage.getItem('authToken'); // 또는 쿠키/상태 관리 도구
  const location = useLocation();
  
  useEffect(() => {
    if (!token  && (location.pathname !== '/login' && location.pathname !== '/')) {
      if (!toast.isActive("auth-error")) {
        toast.error("로그인이 필요한 페이지입니다.", {
          toastId: "auth-error",
        });
      }
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }}/>;
  }

  return <Outlet />;
};

export default ProtectedRoute;