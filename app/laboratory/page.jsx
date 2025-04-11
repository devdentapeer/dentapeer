import { Suspense } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

import { redirect } from "next/navigation"
import GridLabOrders from "@/components/laboratory/GridLabOrders"
import GridLabProduction from "@/components/laboratory/GridLabProduction"
import GridLabOffers from "@/components/laboratory/GridLabOffers"
import GridLabCompletedOrders from "@/components/laboratory/GridLabCompletedOrders"
import { auth } from "@/auth"
import HeaderLaboratory from "@/components/laboratory/HeaderLaboratory"

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

export default async function LaboratoryPage() {
  const user = await getUser()

  return (
    <div className="min-h-screen bg-background">
      <HeaderLaboratory user={user} />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mt-6 sm:mt-8">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="flex flex-col space-y-2 my-20 sm:space-y-0 sm:grid sm:grid-cols-2 sm:my-10 lg:my-6 lg:grid-cols-4 w-full">
              <TabsTrigger 
                value="orders" 
                className="text-sm sm:text-base whitespace-normal h-auto py-2 px-4"
              >
                Açık Siparişler
              </TabsTrigger>
              <TabsTrigger 
                value="production"
                className="text-sm sm:text-base whitespace-normal h-auto py-2 px-4"
              >
                Üretimdeki Siparişler
              </TabsTrigger>
              <TabsTrigger 
                value="offers"
                className="text-sm sm:text-base whitespace-normal h-auto py-2 px-4"
              >
                Verilen Teklifler
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="text-sm sm:text-base whitespace-normal h-auto py-2 px-4"
              >
                Tamamlanan Siparişler
              </TabsTrigger>
            </TabsList>

            <TabsContent 
              value="orders" 
              className="mt-4 sm:mt-6"
            >
              <Suspense fallback={
                <div className="text-center p-4 text-sm sm:text-base text-muted-foreground">
                  <LoadingCard />
                </div>
              }>
                <GridLabOrders />
              </Suspense>
            </TabsContent>
            
            <TabsContent 
              value="production" 
              className="mt-4 sm:mt-6"
            >
              <Suspense fallback={
                <div className="text-center p-4 text-sm sm:text-base text-muted-foreground">
                  <LoadingCard />
                </div>
              }>
                <GridLabProduction />
              </Suspense>
            </TabsContent>
            
            <TabsContent 
              value="offers" 
              className="mt-4 sm:mt-6"
            >
              <Suspense fallback={
                <div className="text-center p-4 text-sm sm:text-base text-muted-foreground">
                  <LoadingCard />
                </div>
              }>
                <GridLabOffers />
              </Suspense>
            </TabsContent>
            
            <TabsContent 
              value="completed" 
              className="mt-4 sm:mt-6"
            >
              <Suspense fallback={
                <div className="text-center p-4 text-sm sm:text-base text-muted-foreground">
                  <LoadingCard />
                </div>
              }>
                <GridLabCompletedOrders />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function LoadingCard() {
  return (
    <Card className="p-4 sm:p-8">
      <p className="text-center text-sm sm:text-base text-muted-foreground">
        Yükleniyor...
      </p>
    </Card>
  )
} 