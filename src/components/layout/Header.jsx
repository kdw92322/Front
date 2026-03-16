import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FaSignOutAlt } from 'react-icons/fa'
import { getTokenExpiry } from '@/lib/auth'
import { useNavigate } from 'react-router-dom';

const formatDuration = (ms) => {
  if (ms <= 0) return '00:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export function Header({ userId, onLogout }) {
  const [countdown, setCountdown] = useState('00:00:00')
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/main')
  }      
  
  useEffect(() => {
    const expiry = getTokenExpiry()
    if (!expiry) {
      setCountdown('00:00:00')
      return
    }

    const tick = () => {
      const diff = expiry.getTime() - Date.now()
      setCountdown(formatDuration(diff))
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <div>
        <Button onClick={goHome} variant="ghost" className="p-2">
          <h1 className="text-xl font-bold text-slate-900">My App Dashboard</h1>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">{userId ? `${userId}님` : '게스트'}이 접속하셨습니다.</span>
        <span className="text-sm text-slate-600 font-medium">{countdown}</span>
        <Button onClick={onLogout} variant="ghost" className="p-2">
          <FaSignOutAlt className="h-4 w-4" title="Logout" />
        </Button>
      </div>
    </header>
  )
}
