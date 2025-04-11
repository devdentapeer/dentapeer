"use client"

import { format } from "date-fns"
import { tr } from "date-fns/locale"

export function MessageBubble({ message, isCurrentUser }) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="max-w-[70%]">
        <div className="mb-1 px-1">
          <span className={`text-sm font-medium ${isCurrentUser ? 'text-primary' : 'text-muted-foreground'}`}>
            {isCurrentUser ? "Siz" : message.sender.name}
          </span>
        </div>
        
        <div className={`
          w-full rounded-lg px-4 py-2
          ${isCurrentUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'}
        `}>
          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs mt-1 opacity-70">
            {format(new Date(message.createdAt), 'HH:mm', { locale: tr })}
          </p>
        </div>
      </div>
    </div>
  )
} 