"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { pusherClient } from "@/libs/pusher"

const PusherContext = createContext(null)

export function usePusherConnection() {
  const context = useContext(PusherContext)
  if (!context) {
    throw new Error("usePusherConnection must be used within a PusherProvider")
  }
  return context
}

export function PusherProvider({ 
  channelName, 
  eventName, 
  onMessage, 
  children 
}) {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef(null)
  const connectionRef = useRef(null)

  useEffect(() => {
    function connect() {
      // Avoid duplicate connections
      if (connectionRef.current?.state === "connected") {
        return
      }

      // Initialize connection
      connectionRef.current = pusherClient
      
      // Bind to connection events
      connectionRef.current.connection.bind("connected", () => {
        setIsConnected(true)
      })

      connectionRef.current.connection.bind("disconnected", () => {
        setIsConnected(false)
      })

      connectionRef.current.connection.bind("error", (err) => {
        console.error("Pusher connection error:", err)
        setIsConnected(false)
      })

      // Subscribe to channel
      channelRef.current = connectionRef.current.subscribe(channelName)
      
      // Bind to event
      channelRef.current.bind(eventName, (data) => {
        onMessage?.(data)
      })
    }

    function disconnect() {
      if (channelRef.current) {
        channelRef.current.unbind(eventName)
        connectionRef.current?.unsubscribe(channelName)
        channelRef.current = null
      }

      if (connectionRef.current) {
        connectionRef.current.connection.unbind_all()
        connectionRef.current.disconnect()
        connectionRef.current = null
      }

      setIsConnected(false)
    }

    // Handle visibility change
    function handleVisibilityChange() {
      if (document.hidden) {
        disconnect()
      } else {
        connect()
      }
    }

    // Initial connection
    connect()

    // Add visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Cleanup on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      disconnect()
    }
  }, [channelName, eventName, onMessage])

  return (
    <PusherContext.Provider value={{ isConnected }}>
      {children}
    </PusherContext.Provider>
  )
} 