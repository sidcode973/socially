"use client";

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import React from 'react'

interface providerProps {
    children: React.ReactNode
}

const Providers = ({ children}: providerProps) => {
  return (
    <SessionProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1c1c1c',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#a855f7', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } },
          }}
        />
    </SessionProvider>
  )
}

export default Providers
  