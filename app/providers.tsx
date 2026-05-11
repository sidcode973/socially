import { SessionProvider } from 'next-auth/react'
import React from 'react'

interface providerProps {
    children: React.ReactNode
}

const Providers = ({ children}: providerProps) => {
  return (
    <SessionProvider>
        {children}
    </SessionProvider>
  )
}

export default Providers
  