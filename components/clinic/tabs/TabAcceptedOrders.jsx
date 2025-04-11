import { getAcceptedOrders } from "@/app/_actions/clinic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, Calendar, Clock, ClipboardList, CheckCircle2, Banknote, Timer, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const STATUS_STYLES = {
  "teklif_kabul_edildi": {
    color: "bg-blue-50 text-blue-600 border-blue-200",
    icon: CheckCircle2,
    label: "Teklif Kabul Edildi"
  },    
  "uretimde": {
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: Package,
    label: "Üretimde"
  },
  "gonderime_hazir": {
    color: "bg-purple-50 text-purple-600 border-purple-200",
    icon: Package,
    label: "Gönderime Hazır"
  },
  "kargoda": {
    color: "bg-green-50 text-green-600 border-green-200",
    icon: Truck,
    label: "Kargoda"
  },
  "teslim_edildi": {
    color: "bg-green-50 text-green-600 border-green-200",
    icon: Truck,
    label: "Teslim Edildi"
  } 
}

export default async function TabAcceptedOrders() {
  const orders = await getAcceptedOrders()

  if (!orders.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Onaylanmış sipariş bulunmuyor.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const status = STATUS_STYLES[order.status]
        const StatusIcon = status.icon
        const timeAgo = order.updatedAt 
          ? formatDistanceToNow(new Date(order.updatedAt), { 
              addSuffix: true,
              locale: tr 
            })
          : formatDistanceToNow(new Date(order.createdAt), { 
              addSuffix: true,
              locale: tr 
            })

        return (
          <Card key={order.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">
                    {order.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${status.color} flex items-center gap-1`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span>{status.label}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Sipariş ID: {order.id}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {order.updatedAt !== order.createdAt 
                        ? `Son güncelleme ${timeAgo}`
                        : `Oluşturuldu ${timeAgo}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {/* Order Details */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Açıklama</span>
                    </div>
                    <p className="text-muted-foreground">{order.description}</p>
                  </div>

                  {/* Price Information */}
                  <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Kabul Edilen Teklif</span>
                    </div>
                    <Badge variant="secondary" className="text-base px-3">
                      ₺{order.price?.toLocaleString('tr-TR')}
                    </Badge>
                  </div>

                  {/* Delivery Time */}
                  <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Teslimat Süresi</span>
                    </div>
                    <p className="text-muted-foreground">
                      {order.deliveryTime}
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Sipariş Tarihi</span>
                    </div>
                    <p className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="relative flex justify-between">
                  {["teklif_kabul_edildi",'uretimde', 'gonderime_hazir', 'kargoda','teslim_edildi'].map((step, index) => {
                    const isActive = order.status === step
                    const isPast = ['teklif_kabul_edildi', 'uretimde', 'gonderime_hazir', 'kargoda','teslim_edildi']
                        .indexOf(order.status) >= ['teklif_kabul_edildi', 'uretimde', 'gonderime_hazir', 'kargoda','teslim_edildi'  ]
                      .indexOf(step)

                    return (
                      <div 
                        key={step} 
                        className={`flex flex-col items-center relative z-10 ${
                          isActive ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-muted'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-primary text-white' : 
                          isPast ? 'bg-muted-foreground text-white' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          
                        </div>
                        <span className="text-xs mt-1">{STATUS_STYLES[step].label}</span>
                      </div>
                    )
                  })}
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 w-full h-[2px] bg-muted -z-0">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${
                          ['teklif_kabul_edildi', 'uretimde', 'gonderime_hazir', 'kargoda','teslim_edildi']
                            .indexOf(order.status) * 50
                        }%`
                      }}
                    />
                  </div>
                 
                </div>
                <div className="flex justify-end mt-12">
                    <Button asChild variant="default" className="gap-1.5">
                      <Link href={`/orders/${order.id}`}>
                        <ExternalLink className="h-4 w-4" />
                        Sipariş Detayları
                      </Link>
                    </Button>
                  </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 