import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

interface SocketProviderProps {
  children: ReactNode
}

// Only connect when a realtime endpoint is actually configured. This used to
// default to ws://localhost:3001; with no server there, socket.io retried
// forever and logged a connect_error on EVERY page of the app.
const SOCKET_URL = import.meta.env.VITE_WS_URL as string | undefined

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, tokens } = useAuth()

  useEffect(() => {
    if (user && tokens && SOCKET_URL) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: tokens.accessToken,
        },
        autoConnect: true,
        // bounded backoff instead of an endless retry storm
        reconnectionAttempts: 3,
        reconnectionDelay: 1500,
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        // Realtime is optional; degrade quietly instead of erroring per page.
        if (import.meta.env.DEV) {
          console.warn('Socket unavailable:', (error as Error)?.message ?? error)
        }
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
        setSocket(null)
        setIsConnected(false)
      }
    } else {
      // User not authenticated, close socket if it exists
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [user, tokens])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}