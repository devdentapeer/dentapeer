"use client"

import { useEffect, useRef, useState } from "react"
import { pusherClient } from "@/libs/pusher"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

function MessageBubble({ message, isCurrentUser }) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`
        max-w-[70%] rounded-lg px-4 py-2
        ${isCurrentUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'}
      `}>
        <p className="text-sm">{message.content}</p>
        <p className="text-xs mt-1 opacity-70">
          {format(new Date(message.createdAt), 'HH:mm', { locale: tr })}
        </p>
      </div>
    </div>
  )
}

export default function MessageList({ orderId, initialMessages, currentUser }) {
  const [messages, setMessages] = useState(initialMessages)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const channel = pusherClient.subscribe(`order-${orderId}`)
    
    channel.bind('new-message', (newMessage) => {
      setMessages((current) => [...current, newMessage])
    })

    return () => {
      pusherClient.unsubscribe(`order-${orderId}`)
    }
  }, [orderId])

  return (
    <div className="h-[400px] overflow-y-auto p-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isCurrentUser={message.sender.id === currentUser.id}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
} 