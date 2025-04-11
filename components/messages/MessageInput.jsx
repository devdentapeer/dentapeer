"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { sendMessage } from "@/app/_actions/messages"
import { toast } from "sonner"

export default function MessageInput({ orderId }) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) return

    try {
      setIsLoading(true)
      await sendMessage(orderId, message.trim())
      setMessage("")
    } catch (error) {
      toast.error("Mesaj gönderilemedi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mesajınızı yazın..."
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
} 