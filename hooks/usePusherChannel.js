"use client"

import { useEffect, useRef } from "react"
import { pusherClient } from "@/libs/pusher"

export function usePusherChannel({
  channelName,
  eventName,
  onEvent,
  enableSubscription = true
}) {
  // Refs to maintain persistent instances and avoid unnecessary re-subscriptions
  const channelRef = useRef(null)
  const eventHandlerRef = useRef(onEvent)

  // Update event handler ref if callback changes
  useEffect(() => {
    eventHandlerRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!enableSubscription) return

    // Avoid duplicate subscriptions
    if (channelRef.current?.name === channelName) {
      return
    }

    // Cleanup previous subscription if channel name changes
    if (channelRef.current) {
      channelRef.current.unbind_all()
      pusherClient.unsubscribe(channelRef.current.name)
    }

    // Subscribe to new channel
    const channel = pusherClient.subscribe(channelName)
    channelRef.current = channel

    // Bind event handler
    channel.bind(eventName, (data) => {
      eventHandlerRef.current?.(data)
    })

    // Cleanup on unmount or channel change
    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(channelName)
      channelRef.current = null
    }
  }, [channelName, eventName, enableSubscription])

  return channelRef.current
} 