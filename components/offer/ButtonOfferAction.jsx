"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateOfferStatus } from "@/app/_actions/offers"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function ButtonOfferAction({ offerId, action }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const actionConfig = {
    accept: {
      label: "Teklifi Kabul Et",
      status: "kabul_edildi",
      style: "flex-1 bg-emerald-600 hover:bg-emerald-700 hover:text-white",
      variant: "default"
    },
    reject: {
      label: "Teklifi Reddet",
      status: "reddedildi",
      style: "flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-600",
      variant: "outline"
    }
  }

  const config = actionConfig[action]

  async function handleAction() {
    try {
      setIsLoading(true)
      await updateOfferStatus(offerId, config.status)
      toast.success(`Teklif ${config.status === "kabul_edildi" ? "kabul edildi" : "reddedildi"}`)
      router.refresh()
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={config.variant}
      className={config.style}
      onClick={handleAction}
      disabled={isLoading}
    >
      {isLoading ? "İşleniyor..." : config.label}
    </Button>
  )
}

export default ButtonOfferAction 