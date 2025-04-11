import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import HeaderClinic from "@/components/clinic/HeaderClinic"
import FormNewOrder from "@/components/order/FormNewOrder"
import { auth } from "@/auth"

export default async function NewOrderPage() {
  const { user } = await auth()
  
  return (
    <div className="min-h-screen bg-background">
      <HeaderClinic user={user} />
      
      <div className="container container-fluid mx-auto px-4 py-8">
        <div className="mb-8 space-y-6">
          <Link 
            href="/clinic" 
            className="inline-flex items-center text-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Yeni Sipariş Oluştur</h1>
            <p className="text-muted-foreground">
              Siparişinizin detaylarını girin ve laboratuvarlardan teklif almaya başlayın.
            </p>
          </div>
        </div>

        <div className="rounded-lg  bg-card">
          <div className="p-6">
            <FormNewOrder />
          </div>
        </div>
      </div>
    </div>
  )
} 