import { getClinicOrdersWithUpdates } from "@/app/_actions/clinic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Package, Truck, CheckCircle2 } from "lucide-react"

const STATUS_STYLES = {
  "teklif_bekleniyor": {
    color: "bg-blue-50 text-blue-600 border-blue-200",
    icon: Clock,
    label: "Teklif Bekleniyor"
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
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: CheckCircle2,
    label: "Teslim Edildi"
  }
}

export default async function OrdersWithUpdates() {
  const orders = await getClinicOrdersWithUpdates()

  return (
    <div className="space-y-4">
      {orders.map(order => {
        
        const status = STATUS_STYLES[order.status] || STATUS_STYLES.teklif_bekleniyor
        const StatusIcon = status.icon

        return (
          <Card key={order.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">{order.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${status.color} flex items-center gap-1 px-2 py-0.5`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span>{status.label}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Sipariş ID: {order.id.toString().slice(0, 10)}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">Malzeme Sayısı</p>
                  <p className="text-muted-foreground">{order.materials?.length || 0} adet</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Açıklama</h4>
                  <p className="text-sm text-muted-foreground">{order.description}</p>
                </div>
                
                {order.materials && order.materials.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Malzemeler</h4>
                    <div className="grid gap-2">
                      {order.materials.map((material, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between rounded-md border p-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">{material.materialId.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {material.materialId.category}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {material.quantity} adet
                          </Badge>
                        </div>
                      ))}
                    </div>
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
