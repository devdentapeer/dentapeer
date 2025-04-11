import { getCompletedOrders } from "@/app/_actions/clinic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Calendar, Clock, ClipboardList, Banknote, Timer, Building2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export default async function TabCompletedOrders() {
  const orders = await getCompletedOrders()

  if (!orders.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Tamamlanmış sipariş bulunmuyor.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const timeAgo = formatDistanceToNow(new Date(order.completedAt || order.updatedAt), { 
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
                      className="bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Tamamlandı</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Sipariş ID: {order.id}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
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
                      <span className="font-medium">Laboratuvar</span>
                    </div>
                    <p className="text-muted-foreground">{order.laboratoryName}</p>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Açıklama</span>
                    </div>
                    <p className="text-muted-foreground">{order.description}</p>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Ödenen Tutar</span>
                    </div>
                    <Badge variant="secondary" className="text-base px-3">
                      ₺{order.price?.toLocaleString('tr-TR')}
                    </Badge>
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
                    <p className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                {/* Completion Notice */}
                <div className="rounded-md bg-emerald-50 p-3 flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div className="text-sm text-emerald-600">
                    <p className="font-medium">Sipariş Tamamlandı</p>
                    <p className="mt-1">Bu sipariş başarıyla tamamlanmış ve teslim edilmiştir.</p>
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