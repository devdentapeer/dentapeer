import { getLabOffers } from "@/app/_actions/offers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle, Building2, Banknote, Timer, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

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
  },
  "iptal_edildi": {
    color: "bg-gray-50 text-gray-600 border-gray-200",
    icon: XCircle,
    label: "İptal Edildi"
  }
}

function CardLabOffer({ offer }) {
  const status = OFFER_STATUS_STYLES[offer.status]
  const StatusIcon = status.icon
  const timeAgo = formatDistanceToNow(new Date(offer.createdAt), { 
    addSuffix: true,
    locale: tr 
  })

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {offer.orderTitle}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={status.color}
              >
                <StatusIcon className="mr-1 h-3.5 w-3.5" />
                {status.label}
              </Badge>
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

          {offer.status === "kabul_edildi" && (
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

export default async function GridLabOffers() {
  const offers = await getLabOffers()

  if (!offers?.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Verilen teklif bulunmuyor.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Verilen Teklifler</h2>
        <p className="text-sm text-muted-foreground">
          Toplam {offers.length} teklif
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <CardLabOffer key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  )
} 