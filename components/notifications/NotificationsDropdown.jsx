"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { getUnseenMessages } from "@/app/_actions/notifications"

export default function NotificationsDropdown() {
  const [unseenMessages, setUnseenMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const fetchUnseenMessages = async () => {
    try {
      setIsLoading(true)
      const messages = await getUnseenMessages()
      setUnseenMessages(messages)
    } catch (error) {
      console.error("Error fetching unseen messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUnseenMessages()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnseenMessages, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMessageClick = async (orderId) => {
    router.push(`/orders/${orderId}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unseenMessages.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unseenMessages.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Yükleniyor...
          </div>
        ) : unseenMessages.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Okunmamış mesaj bulunmuyor
          </div>
        ) : (
          unseenMessages.map((message) => (
            <DropdownMenuItem
              key={message.id}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              onClick={() => handleMessageClick(message.order.id)}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-sm">
                  {message.sender.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.createdAt), 'HH:mm', { locale: tr })}
                </span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {message.order.title}
              </span>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {message.content}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 