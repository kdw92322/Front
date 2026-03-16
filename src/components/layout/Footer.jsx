import React from 'react'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} My App. All rights reserved.
    </footer>
  )
}
