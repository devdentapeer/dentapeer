import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Building2, Banknote, Timer, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export default function CardLabOffer({ offer }) {
  // Calculate time ago for the offer creation date
  const timeAgo = formatDistanceToNow(new Date(offer.createdAt), { 
    addSuffix: true,
    locale: tr 
  })

  // Determine if this is an accepted offer that should show the details button
  const isAcceptedOffer = offer.status === "kabul_edildi"

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {offer.orderTitle || "Dental Crown"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={isAcceptedOffer 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1"
                  : "bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1"
                }
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{isAcceptedOffer ? "Kabul Edildi" : "Teklif Verildi"}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                Teklif ID: {offer.id}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Klinik</span>
              </div>
              <p className="text-muted-foreground">{offer.clinic}</p>
            </div>

            <div className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Teklif Edilen Fiyat</span>
              </div>
              <Badge variant="secondary" className="text-base">
                ₺{offer.price?.toLocaleString('tr-TR')}
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Teslimat Süresi</span>
              </div>
              <p className="text-muted-foreground">{offer.deliveryTime}</p>
            </div>

            <div className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Teklif Tarihi</span>
              </div>
              <p className="text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          
          {/* Only show the "Sipariş Detayları" button for accepted offers */}
          {isAcceptedOffer && (
            <div className="flex justify-end mt-4">
              <Button asChild variant="default" className="gap-1.5">
                <Link href={`/orders/${offer.orderId}`}>
                  <ExternalLink className="h-4 w-4" />
                  Sipariş Detayları
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 