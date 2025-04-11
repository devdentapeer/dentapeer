import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

function TableClinicOrders({ orders }) {
  return (
    <div className="rounded-lg border bg-foreground shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background/50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Sipariş ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Ürün</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Miktar</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Durum</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Teslimat Tarihi</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Teklifler</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-3">{order.id}</td>
                <td className="px-4 py-3">{order.product}</td>
                <td className="px-4 py-3">{order.quantity}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">{order.dueDate}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm">
                    Görüntüle ({order.offerCount})
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Detayları Görüntüle</DropdownMenuItem>
                      <DropdownMenuItem>Siparişi Düzenle</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Siparişi İptal Et</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }) {
  const statusStyles = {
    "Pending Offers": "bg-warning/10 text-warning border border-warning/20",
    "In Production": "bg-primary/10 text-primary border border-primary/20",
    "Completed": "bg-success/10 text-success border border-success/20",
    "Cancelled": "bg-error/10 text-error border border-error/20",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  )
}

export default TableClinicOrders 