"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createOffer, checkExistingOffer } from "@/app/_actions/offers"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Banknote, Timer, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  totalPrice: z.string().min(1, "Fiyat gerekli"),
  deliveryTime: z.string().min(1, "Teslimat süresi gerekli"),
})

export default function ButtonMakeOffer({ order }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [existingOffer, setExistingOffer] = useState(null)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalPrice: "",
      deliveryTime: "",
    }
  })

  useEffect(() => {
    async function checkOffer() {
      try {
        const offer = await checkExistingOffer(order.id)
        setExistingOffer(offer)
      } catch (error) {
        console.error("Teklif kontrol hatası:", error)
      } finally {
        setIsChecking(false)
      }
    }
    checkOffer()
  }, [order.id])

  async function onSubmit(values) {
    try {
      setIsLoading(true)
      
      const formData = {
        orderId: order.id,
        price: parseFloat(values.totalPrice),
        deliveryTime: values.deliveryTime,
      }

      const result = await createOffer(formData)
      
      if (result && result.id) {
        toast.success("Teklif başarıyla gönderildi")
        setOpen(false)
        router.refresh()
      } else {
        throw new Error("Teklif oluşturulamadı")
      }
    } catch (error) {
      console.error("Teklif gönderme hatası:", error)
      toast.error(error.message || "Teklif gönderilirken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return <Button disabled>Kontrol ediliyor...</Button>
  }

  if (existingOffer && ["bekleniyor", "kabul_edildi"].includes(existingOffer.status)) {
    const statusConfig = {
      bekleniyor: {
        icon: AlertCircle,
        title: "Bekleyen Teklifiniz Var",
        description: "Bu sipariş için zaten bir teklifiniz bulunmaktadır. Sonucu bekleyiniz.",
        color: "bg-blue-50 border-blue-200",
        textColor: "text-blue-600",
        showButton: false
      },
      kabul_edildi: {
        icon: CheckCircle,
        title: "Teklif Kabul Edildi",
        description: "Bu sipariş için teklifiniz kabul edilmiştir.",
        color: "bg-green-50 border-green-200",
        textColor: "text-green-600",
        showButton: false
      }
    }

    const config = statusConfig[existingOffer.status]
    const Icon = config.icon

    return (
      <Alert className={`${config.color} mb-4`}>
        <Icon className={`h-4 w-4 ${config.textColor}`} />
        <AlertTitle className={config.textColor}>{config.title}</AlertTitle>
        <AlertDescription className={cn(config.textColor, "mt-2")}>
          {config.description}
          <div className="mt-2 text-sm">
            <p>Teklif: ₺{existingOffer.price.toLocaleString('tr-TR')}</p>
            <p>Teslimat: {existingOffer.deliveryTime} Gün</p>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {existingOffer?.status === "reddedildi" ? "Yeni Teklif Ver" : "Teklif Ver"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Teklif Ver</DialogTitle>
            <DialogDescription>
              {order.title} siparişi için teklif oluşturun.
              {existingOffer?.status === "reddedildi" && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTitle>Önceki Teklifiniz Reddedildi</AlertTitle>
                  <AlertDescription>
                    Önceki teklif: ₺{existingOffer.price.toLocaleString('tr-TR')} - {existingOffer.deliveryTime}
                  </AlertDescription>
                </Alert>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Toplam Fiyat (₺)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Teslimat Süresi
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="örn: 5 iş günü"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Gönderiliyor..." : "Teklif Gönder"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
} 