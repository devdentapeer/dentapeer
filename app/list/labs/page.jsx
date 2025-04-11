import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import LabsList from "@/components/labs/LabsList"
 import HeaderClinic from "@/components/clinic/HeaderClinic"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
 
async function getUser() {
  const session = await auth()
  if (!session) {
    return redirect("/login")
  }
  if (session.user.role !== "diş_kliniği") {
    return redirect("/laboratory")
  }
  return session.user
}

export default async function LabsListPage() {
  const user = await getUser()

  return (
    <div className="min-h-screen bg-background">
      <HeaderClinic user={user}   />
      
      <main className="container mx-auto px-4 py-8">
      <Link 
            href="/clinic" 
            className="inline-flex items-center text-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
        <h1 className="text-2xl font-bold">Laboratuvar Listesi</h1>



        <Suspense fallback={<LoadingCard />}>
          <LabsList />
        </Suspense>
      </main>
    </div>
  )
}

function LoadingCard() {
  return (
    <Card className="p-8">
      <p className="text-center text-muted-foreground">
        Yükleniyor...
      </p>
    </Card>
  )
} 