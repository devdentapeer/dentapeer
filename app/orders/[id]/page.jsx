import { getOrderDetails } from "@/app/_actions/orders"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Separator } from "@/components/ui/separator"
import OrderStatusTracker from "@/components/order/OrderStatusTracker"
import OrderStatusUpdater from "@/components/order/OrderStatusUpdater"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import MessageList from "@/components/messages/MessageList"
import MessageInput from "@/components/messages/MessageInput"
import { getMessages } from "@/app/_actions/messages"
import { auth } from "@/auth"
import RealtimeMessages from "@/components/messages/RealtimeMessages"
import { markMessageAsSeen } from "@/app/_actions/notifications"
import MessageSeenHandler from "@/components/messages/MessageSeenHandler"

// Map of statuses to display properties
const STATUS_CONFIG = {
  "teklif_kabul_edildi": {
    label: "Teklif Kabul Edildi",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  "uretimde": {
    label: "Üretimde",
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  "gonderime_hazir": {
    label: "Gönderime Hazır",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  "kargoda": {
    label: "Kargoda",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  "teslim_edildi": {
    label: "Teslim Edildi",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  "iptal_edildi": {
    label: "İptal Edildi",
    color: "bg-red-50 text-red-600 border-red-200",
  }
}

export default async function OrderDetailsPage({ params }) {
  // Important: Next.js requires dynamic params to be properly validated
 
  const {id} = await params
  const orderId = id

  const {user} = await auth()
  if (!user) {
    redirect("/login")
  } 
  try {
    const orderDetails = await getOrderDetails(orderId)
    const messages = await getMessages(orderId)
    
    // Format dates
    const createdDate = format(new Date(orderDetails.createdAt), 'PPP', { locale: tr })
    const updatedDate = format(new Date(orderDetails.updatedAt), 'PPP', { locale: tr })
    const offerDate = format(new Date(orderDetails.offer.createdAt), 'PPP', { locale: tr })

    // Get status details
    const status = STATUS_CONFIG[orderDetails.status] || {
      label: "Bilinmiyor",
      color: "bg-gray-50 text-gray-600 border-gray-200",
    }

    // Check if messaging is allowed based on order status
    const isMessagingDisabled = ["iptal_edildi", "teslim_edildi"].includes(orderDetails.status)

    return (
      <div className="container mx-auto py-8 space-y-8">
        {/* Add Back Link */}
        <Link 
          href={orderDetails.userRole === "diş_kliniği" ? "/clinic" : "/laboratory"} 
          className="inline-flex items-center text-sm text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sipariş Detayları</h1>
          <Badge className={status.color}>
            {status.label}
          </Badge>
        </div>

        <OrderStatusTracker currentStatus={orderDetails.status} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Sipariş Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{orderDetails.title}</h3>
                <p className="text-muted-foreground mt-1">
                  {orderDetails.description}
                </p>
                {orderDetails.modelUrl && (
                  <div className="mt-4">
                    <Button asChild variant="outline" className="gap-1.5">
                      <a href={orderDetails.modelUrl} download>
                        <Download className="h-4 w-4" />
                        Model Dosyasını İndir
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Sipariş Oluşturulma Tarihi</p>
                  <p className="text-muted-foreground">{createdDate}</p>
                </div>
                <div>
                  <p className="font-medium">Son Güncelleme Tarihi</p>
                  <p className="text-muted-foreground">{updatedDate}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Malzemeler</h3>
                <div className="space-y-2">
                  {orderDetails.materials.map(material => (
                    <Card key={material.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {material.category}
                            </p>
                            {material.description && (
                              <p className="text-sm mt-1">
                                {material.description}
                              </p>
                            )}
                            {material.notes && (
                              <p className="text-sm italic mt-1">
                                Not: {material.notes}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline text-muted">
                            {material.quantity} adet
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Accepted Offer Card */}
            <Card>
              <CardHeader>
                <CardTitle>Kabul Edilen Teklif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Fiyat</p>
                    <p className="text-xl font-bold text-emerald-600">
                      ₺{orderDetails.offer.price.toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Teslimat Süresi</p>
                    <p className="text-muted-foreground">
                      {orderDetails.offer.deliveryTime}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Teklif Tarihi</p>
                    <p className="text-muted-foreground">{offerDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants Card */}
            <Card>
              <CardHeader>
                <CardTitle>Taraflar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Klinik</p>
                  <p className="text-muted-foreground">
                    {orderDetails.clinic.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {orderDetails.clinic.email}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="font-medium">Laboratuvar</p>
                  <p className="text-muted-foreground">
                    {orderDetails.laboratory.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {orderDetails.laboratory.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status Update Card - Only for appropriate role */}
            {orderDetails.userRole === "laboratuvar" && 
             !["teslim_edildi", "iptal_edildi"].includes(orderDetails.status) && (
              <OrderStatusUpdater 
                orderId={orderDetails.id} 
                currentStatus={orderDetails.status} 
              />
            )}
          </div>
        </div>

        {/* Messages Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Mesajlar</CardTitle>
            {isMessagingDisabled && (
              <p className="text-sm text-muted-foreground">
                {orderDetails.status === "iptal_edildi" 
                  ? "İptal edilen siparişlerde mesajlaşma kapalıdır."
                  : "Tamamlanan siparişlerde mesajlaşma kapalıdır."}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <MessageSeenHandler 
              messages={messages}
              currentUserId={user.id}
              orderId={id}
            />
            <RealtimeMessages
              channelName={`order-${id}`}
              initialMessages={messages}
              currentUser={{
                id: user.id,
                role: user.role
              }}
            />
            {!isMessagingDisabled && <MessageInput orderId={id} />}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Order details render error:", error)
    return notFound()
  }
} 