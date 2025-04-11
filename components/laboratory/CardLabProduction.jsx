import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar, Building2, Timer, ClipboardList, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function CardLabProduction({ order }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {order.title || "Dental Crown"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1"
              >
                <Package className="h-3.5 w-3.5" />
                <span>Üretimde</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                Sipariş ID: {order.id}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            Durumu Güncelle
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
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
              <p className="text-muted-foreground">{order.clinic}</p>
            </div>

            <div className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Tahmini Bitiş</span>
              </div>
              <p className="text-muted-foreground">
                {new Date(order.estimatedCompletion).toLocaleDateString('tr-TR')}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Üretim Durumu</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={65} className="w-24" />
                <span className="text-xs text-muted-foreground">%65</span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-amber-50 p-3">
            <div className="flex gap-2">
              <Package className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-600">
                <p className="font-medium">Üretim Aşamasında</p>
                <p className="mt-1">Tahmini teslim tarihi: {new Date(order.estimatedCompletion).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 