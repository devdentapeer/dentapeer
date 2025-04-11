"use client"

import { logout } from "@/app/_actions/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"

export default function ButtonLogout() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    try {
      setIsLoading(true)
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
    </Button>
  )
} 