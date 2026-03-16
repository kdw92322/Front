import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Main from './pages/Main.jsx'
import { UserManagement } from '@/components/layout/UserManagement'
import Layout from '@/components/layout/Layout.jsx'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/main" element={<Main />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/" element={<Navigate to="/main" replace />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/main" element={<Main />} />
        <Route path="/users" element={<UserManagement />} />
        {/* <Route path="/auth" element={<AuthManagement />} /> */}
        {/* <Route path="/menu" element={<MenuManagement />} /> */}
      </Routes>
    </Router>
  )
}
