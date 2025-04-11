"use client"

import { useState, useRef, useEffect } from "react"
import { usePusherChannel } from "@/hooks/usePusherChannel"
import { MessageBubble } from "./MessageBubble"
import { format, isToday, isYesterday, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"

function DateSeparator({ date }) {
  let dateText = ""
  
  if (isToday(date)) {
    dateText = "Bugün"
  } else if (isYesterday(date)) {
    dateText = "Dün"
  } else {
    dateText = format(date, "dd.MM.yyyy", { locale: tr })
  }

  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-muted/20 px-3 py-1 rounded-full">
        <span className="text-xs font-medium text-muted-foreground">
          {dateText}
        </span>
      </div>
    </div>
  )
}

export default function RealtimeMessages({ 
  channelName, 
  initialMessages = [],
  currentUser
}) {
  const [messages, setMessages] = useState(initialMessages)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleNewMessage = (message) => {
    setMessages((current) => [...current, message])
    scrollToBottom()
  }

  usePusherChannel({
    channelName,
    eventName: "new-message",
    onEvent: handleNewMessage,
    enableSubscription: Boolean(channelName)
  })

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt)
    const dateStr = format(date, "yyyy-MM-dd")
    
    if (!groups[dateStr]) {
      groups[dateStr] = []
    }
    
    groups[dateStr].push(message)
    return groups
  }, {})

  return (
    <div className="h-[400px] overflow-y-auto p-4">
      {Object.entries(groupedMessages).map(([dateStr, dateMessages]) => {
        const date = new Date(dateStr)
        
        return (
          <div key={dateStr}>
            <DateSeparator date={date} />
            {dateMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.sender.id === currentUser.id}
              />
            ))}
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
} 