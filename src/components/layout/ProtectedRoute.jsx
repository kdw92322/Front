import * as React from 'react';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getToken } from '@/lib/auth';

export function ProtectedRoute() {
  const token = getToken(); // auth 유틸리티를 사용하여 일관성 유지
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