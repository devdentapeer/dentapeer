import { getClinicOffers } from "@/app/_actions/offers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle } from "lucide-react"
import ButtonOfferAction from "@/components/offer/ButtonOfferAction"

const OFFER_STATUS_STYLES = {
  "bekleniyor": {
    color: "bg-blue-50 text-blue-600 border-blue-200",
    icon: Clock,
    label: "Beklemede"
  },
  "kabul_edildi": {
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: CheckCircle2,
    label: "Kabul Edildi"
  },
  "reddedildi": {
    color: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
    label: "Reddedildi"
  }
}

export default async function GridClinicOffers() {
  const offers = await getClinicOffers()

  if (!offers.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Henüz teklif bulunmuyor.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const status = OFFER_STATUS_STYLES[offer.status] || OFFER_STATUS_STYLES.bekleniyor
        const StatusIcon = status.icon
        
        return (
          <Card key={offer.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">
                    {offer.laboratory}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${status.color} flex items-center gap-1 px-2 py-0.5`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span>{status.label}</span>
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">Sipariş Bilgisi</p>
                  <p className="text-muted-foreground line-clamp-1">{offer.orderTitle}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="rounded-md border p-3 bg-muted/5">
                  <h4 className="font-medium mb-2">Sipariş Detayları</h4>
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-2">{offer.orderDescription}</p>
                    <p className="mt-1 text-xs">Sipariş ID: {offer.orderId}</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div>
                      <p className="font-medium">Teklif Fiyatı</p>
                      <p className="text-xs text-muted-foreground">
                        Toplam Tutar
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3">
                      {offer.price}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div>
                      <p className="font-medium">Teslimat Süresi</p>
                      <p className="text-xs text-muted-foreground">
                        Tahmini Süre
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {offer.delivery}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div>
                      <p className="font-medium">Laboratuvar Bilgileri</p>
                      <p className="text-xs text-muted-foreground">
                        Değerlendirme ve İstatistikler
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       
                      <Badge variant="outline text-xs   text-muted-foreground">
                        {offer.completedOrders} Sipariş
                      </Badge>
                    </div>
                  </div>
                </div>

                {offer.status === "bekleniyor" && (
                  <div className="flex gap-2 pt-2">
                    <ButtonOfferAction 
                      offerId={offer.id.toString() } 
                      action="accept" 
                    />
                    <ButtonOfferAction 
                      offerId={offer.id.toString() } 
                      action="reject" 
                    />
                  </div>
                )}

               
               
               
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 