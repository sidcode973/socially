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
            className:
              "!bg-popover !text-popover-foreground !border !border-border",
            style: { fontSize: '14px' },
            success: { iconTheme: { primary: '#a855f7', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } },
          }}
        />
    </SessionProvider>
  )
}

export default Providers
  