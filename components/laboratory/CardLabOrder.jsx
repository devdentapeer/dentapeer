import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Building2, Package, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import ButtonMakeOffer from "./ButtonMakeOffer"

export default function CardLabOrder({ order }) {
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
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                Yeni Sipariş
              </Badge>
              <span className="text-xs text-muted-foreground">
                Sipariş ID: {order.id}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeAgo}</span>
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

            {order.requestedDelivery && (
              <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">İstenilen Teslimat</span>
                </div>
                <p className="text-muted-foreground">
                  {new Date(order.requestedDelivery).toLocaleDateString('tr-TR')}
                </p>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Açıklama
            </h4>
            <p className="text-sm text-muted-foreground">{order.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Malzemeler ({order.materials.length})
            </h4>
            <div className="grid gap-2">
              {order.materials.map((material) => (
                <div 
                  key={material.id}
                  className="flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{material.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {material.category}
                    </p>
                    {material.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {material.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {material.quantity} adet
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <ButtonMakeOffer order={order} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 