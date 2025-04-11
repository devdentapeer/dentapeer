"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateOrderStatus } from "@/app/_actions/orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Status flow and configuration
const NEXT_STATUSES = {
  "teklif_kabul_edildi": {
    next: "uretimde",
    label: "Üretime Başla",
    description: "Sipariş üretim sürecine alınacak."
  },
  "uretimde": {
    next: "gonderime_hazir",
    label: "Gönderime Hazırla",
    description: "Sipariş gönderime hazır olarak işaretlenecek."
  },
  "gonderime_hazir": {
    next: "kargoda",
    label: "Kargoya Ver",
    description: "Sipariş kargoya verildi olarak işaretlenecek."
  },
  "kargoda": {
    next: "teslim_edildi",
    label: "Teslim Edildi",
    description: "Sipariş teslim edildi olarak işaretlenecek."
  }
}

export default function OrderStatusUpdater({ orderId, currentStatus }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const statusConfig = NEXT_STATUSES[currentStatus]
  
  // If we don't have a next status, don't render the component
  if (!statusConfig) return null

  async function handleStatusUpdate() {
    if (!confirm(`Sipariş durumunu "${statusConfig.label}" olarak güncellemek istediğinize emin misiniz?`)) {
      return
    }
    
    try {
      setIsLoading(true)
      await updateOrderStatus(orderId, statusConfig.next)
      toast.success("Sipariş durumu başarıyla güncellendi")
      router.refresh()
    } catch (error) {
      toast.error(error.message || "Sipariş durumu güncellenirken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Durum Güncelleme</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {statusConfig.description}
        </p>
        
        <Button 
          onClick={handleStatusUpdate} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "İşleniyor..." : statusConfig.label}
        </Button>
      </CardContent>
    </Card>
  )
} 