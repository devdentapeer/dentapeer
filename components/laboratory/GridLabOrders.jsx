import { getLabOpenOrders } from "@/app/_actions/laboratory"
import CardLabOrder from "./CardLabOrder"
import { Card } from "@/components/ui/card"

export default async function GridLabOrders() {
  const orders = await getLabOpenOrders()

  if (!orders?.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Mevcut sipariş bulunmuyor.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Açık Siparişler</h2>
        <p className="text-sm text-muted-foreground">
          Toplam {orders.length} sipariş
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <CardLabOrder key={order.id} order={order} />
        ))}
      </div>
    </div>
  )
} 