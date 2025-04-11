"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

function ButtonNewOrder() {
  const router = useRouter()

  return (
    <Button
      variant="default"
      size="sm"
      className="hidden sm:flex"
      onClick={() => router.push("/clinic/orders/new")}
    >
      <Plus className="mr-2 h-4 w-4" />
      Yeni Sipariş
    </Button>
  )
}

export default ButtonNewOrder 