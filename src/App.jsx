import React from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Main from './pages/Main.jsx'
import { UserManagement } from '@/pages/sys/UserManagement'
import { AuthManagement } from '@/pages/sys/AuthManagement'
import { MenuManagement } from '@/pages/sys/MenuManagement'
import { LinkManagement } from '@/pages/sys/LinkManagement'
import { TermsManagement } from '@/pages/sys/TermsManagement'
import { CodeManagement } from '@/pages/sys/CodeManagement'
import { CodeGrpManagement } from '@/pages/sys/CodeGrpManagement'
import { BoardManagement } from '@/pages/sys/BoardManagement'
import Layout from '@/components/layout/Layout.jsx'
import ProtectedRoute from '@/components/layout/ProtectedRoute.jsx'

export default function App() {
  const token = localStorage.getItem('authToken');

  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/main" element={<Main />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/auth" element={<AuthManagement />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="/link" element={<LinkManagement />} />
            <Route path="/terms" element={<TermsManagement />} />
            <Route path="/code" element={<CodeManagement />} />
            <Route path="/codeGroup" element={<CodeGrpManagement />} />
            <Route path="/boardMng" element={<BoardManagement />} />
            <Route path="/" element={<Navigate to={token ? "/main" : "/login"} replace />} />
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
