import { auth } from "@/auth"
import { redirect } from "next/navigation"
import FormInventory from "@/components/laboratory/FormInventory"
import HeaderLaboratory from "@/components/laboratory/HeaderLaboratory"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

async function getUser() {
  const session = await auth();
  if(!session) {
    return redirect("/login");
  }
  if(session.user.role !== "laboratuvar") {
    return redirect("/clinic");
  }
  return session.user;
}

export default async function InventoryPage({ params }) {
  const user = await getUser()

  return (
    <div className="min-h-screen bg-background">
      <HeaderLaboratory user={user} />
      
      <main className="container mx-auto px-4 py-8">
        <Link 
          href="/laboratory" 
          className="inline-flex items-center text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        <div className="my-8 flex items-center justify-between border-b pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Malzeme Envanteri</h1>
            <p className="text-sm text-muted-foreground">
              Laboratuvarınızın malzeme listesini ve fiyatlarını güncelleyin
            </p>
          </div>
        </div>

        <FormInventory labId={user.id} />
      </main>
    </div>
  )
} 