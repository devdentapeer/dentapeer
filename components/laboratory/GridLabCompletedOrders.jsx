import { getLabCompletedOrders } from "@/app/_actions/orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Building2, Timer, Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"

const ORDER_STATUS_STYLES = {
  "teslim_edildi": {
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: CheckCircle2,
    label: "Teslim Edildi"
  }
}

function CardLabCompleted({ order }) {
  const status = ORDER_STATUS_STYLES[order.status]
  const StatusIcon = status.icon
  const timeAgo = formatDistanceToNow(new Date(order.updatedAt || order.createdAt), { 
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
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Tamamlandı {timeAgo}</span>
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
                <span className="font-medium">Tamamlanma Tarihi</span>
              </div>
              <p className="text-muted-foreground">{timeAgo}</p>
            </div>
          </div>

          <div className="flex justify-end">
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

export default async function GridLabCompletedOrders() {
  const orders = await getLabCompletedOrders()

  if (!orders?.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Tamamlanmış sipariş bulunmuyor.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tamamlanan Siparişler</h2>
        <p className="text-sm text-muted-foreground">
          Toplam {orders.length} sipariş
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <CardLabCompleted key={order.id} order={order} />
        ))}
      </div>
    </div>
  )
} 