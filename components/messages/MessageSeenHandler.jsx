"use client"

import { useEffect } from "react"
import { markMessageAsSeen } from "@/app/_actions/notifications"

export default function MessageSeenHandler({ messages, currentUserId }) {
  useEffect(() => {
    async function markUnseenMessages() {
      try {
        const unseenMessages = messages.filter(
          msg => !msg.read && msg.sender.id !== currentUserId
        )

        if (unseenMessages.length > 0) {
          await Promise.all(
            unseenMessages.map(msg => markMessageAsSeen(msg.id))
          )
        }
      } catch (error) {
        console.error("Error marking messages as seen:", error)
      }
    }

    // Add a small delay to ensure the component is mounted
    const timeoutId = setTimeout(markUnseenMessages, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, currentUserId])

  return null
} 