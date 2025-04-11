import { getAwaitingOrders } from "@/app/_actions/clinic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, ClipboardList, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export default async function TabAwaitingOrders() {
  const orders = await getAwaitingOrders()

  if (!orders.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Teklif bekleyen sipariş bulunmuyor.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const timeAgo = formatDistanceToNow(new Date(order.createdAt), { 
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
                      className="bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Teklif Bekleniyor</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Sipariş ID: {order.id}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Oluşturuldu {timeAgo}</span>
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

                {/* Awaiting Notice */}
                <div className="rounded-md bg-blue-50 p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-600">
                    <p className="font-medium">Teklif Bekleniyor</p>
                    <p className="mt-1">Laboratuvarlardan gelen teklifleri "Alınan Teklifler" sekmesinden inceleyebilirsiniz.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 