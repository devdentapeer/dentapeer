import { getLabProductionOrders } from "@/app/_actions/orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Building2, Timer, Calendar, ArrowRight, ExternalLink, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"

const ORDER_STATUS_STYLES = {
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
  }
}

function CardLabProduction({ order }) {
  const status = ORDER_STATUS_STYLES[order.status]
  const StatusIcon = status.icon
  const timeAgo = formatDistanceToNow(new Date(order.createdAt), { 
    addSuffix: true,
    locale: tr 
  })

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {order.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={status.color}
              >
                <StatusIcon className="mr-1 h-3.5 w-3.5" />
                {status.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Sipariş ID: {order.id}
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
              <p className="text-muted-foreground">{order.clinic.name}</p>
            </div>

            <div className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Teslimat Süresi</span>
              </div>
              <p className="text-muted-foreground">{order.deliveryTime}</p>
            </div>

            <div className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Sipariş Tarihi</span>
              </div>
              <p className="text-muted-foreground">{timeAgo}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" className="gap-1.5">
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
}

export default async function GridLabProduction() {
  const orders = await getLabProductionOrders()

  if (!orders?.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Üretimde sipariş bulunmuyor.</p>
      </Card>
    )
  }

  // Group orders by status
  const productionOrders = orders.filter(order => order.status === "uretimde")
  const readyOrders = orders.filter(order => order.status === "gonderime_hazir")
  const shippingOrders = orders.filter(order => order.status === "kargoda")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Üretimdeki Siparişler</h2>
        <p className="text-sm text-muted-foreground">
          Toplam {orders.length} sipariş
        </p>
      </div>

      <div className="space-y-8">
        {/* Production Orders Section */}
        {productionOrders.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-medium">Üretimde ({productionOrders.length})</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {productionOrders.map((order) => (
                <CardLabProduction key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Ready Orders Section */}
        {readyOrders.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-medium">Gönderime Hazır ({readyOrders.length})</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {readyOrders.map((order) => (
                <CardLabProduction key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Shipping Orders Section */}
        {shippingOrders.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-medium">Kargoda ({shippingOrders.length})</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shippingOrders.map((order) => (
                <CardLabProduction key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 