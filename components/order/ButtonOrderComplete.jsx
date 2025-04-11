"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { markOrderCompleted } from "@/app/_actions/orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clock } from "lucide-react"

export default function ButtonOrderComplete({ 
  orderId, 
  userRole,
  isCompletedByClinic,
  isCompletedByLab
}) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Determine if current user has completed
  const hasCurrentUserCompleted = userRole === "diş_kliniği" 
    ? isCompletedByClinic 
    : isCompletedByLab

  // Determine if waiting for other party
  const isWaitingForOther = (
    (userRole === "diş_kliniği" && !isCompletedByLab && isCompletedByClinic) ||
    (userRole === "laboratuvar" && !isCompletedByClinic && isCompletedByLab)
  )

  if (hasCurrentUserCompleted) {
    return (
      <Button 
        disabled 
        variant="outline" 
        className="w-full gap-2"
      >
        <Clock className="h-4 w-4" />
        Diğer tarafın cevabı bekleniyor...
      </Button>
    )
  }

  async function handleComplete() {
    try {
      setIsLoading(true)
      await markOrderCompleted(orderId)
      toast.success("Sipariş başarıyla tamamlandı olarak işaretlendi")
      router.refresh()
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleComplete}
      disabled={isLoading}
      className="w-full gap-2"
    >
      <CheckCircle2 className="h-4 w-4" />
      Tamamlandı olarak işaretle
    </Button>
  )
} 