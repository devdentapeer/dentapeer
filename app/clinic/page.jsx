import { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HeaderClinic from "@/components/clinic/HeaderClinic";
import TabAwaitingOrders from "@/components/clinic/tabs/TabAwaitingOrders";
import TabAcceptedOrders from "@/components/clinic/tabs/TabAcceptedOrders";
import GridClinicOffers from "@/components/clinic/GridClinicOffers";
import { redirect } from "next/navigation";
import StatsDashboardClinic from "@/components/clinic/StatsDashboardClinic";
import TabCompletedOrders from "@/components/clinic/tabs/TabCompletedOrders";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Compass } from "lucide-react";

async function getUser() {
  const session = await auth();
  if (!session) {
    return redirect("/login");
  }
  if (session.user.role !== "diş_kliniği") {
    return redirect("/laboratory");
  }
  return session.user;
}

export default async function ClinicPage() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-background">
      <HeaderClinic user={user}   />

      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>İstatistikler yükleniyor...</div>}>
          <StatsDashboardClinic />
        </Suspense>

        <div className="my-8 flex items-center justify-between border-b pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              Laboratuvar Ağı
            </h2>
            <p className="text-sm text-muted-foreground">
              Türkiye'nin dört bir yanındaki laboratuvarları keşfedin
            </p>
          </div>
          <Button 
      asChild
      variant="outline" 
      className="group hover:bg-primary hover:text-white transition-colors"
    >
      <Link 
        href="/list/labs" 
        className="flex items-center gap-2"
      >
        <Compass className="h-4 w-4 group-hover:animate-pulse" />
        Laboratuvarları Keşfet
      </Link>
    </Button>
        </div>
       
     
        <div className="mt-8">
          <Tabs defaultValue="accepted" className="w-full">
            <TabsList className="flex flex-col space-y-2 my-20 sm:space-y-0 sm:grid sm:grid-cols-2 sm:my-10 lg:my-6 lg:grid-cols-4 w-full">
              <TabsTrigger 
                value="accepted" 
                className="text-sm sm:text-base whitespace-normal h-auto py-2 px-4"
              >
                Onaylanan Siparişler
              </TabsTrigger>
              <TabsTrigger 
                value="awaiting"
                className="text-sm sm:text-base whitespace-normal h-auto py-2 px-4"
              >
                Teklif Bekleyen Siparişler
              </TabsTrigger>
              <TabsTrigger 
                value="offers"
                className="text-sm sm:text-base whitespace-normal h-auto py-2 px-4"
              >
                Alınan Teklifler
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="text-sm sm:text-base whitespace-normal h-auto py-2 px-4"
              >
                Tamamlanan Siparişler
              </TabsTrigger>
            </TabsList>
            
            <TabsContent 
              value="awaiting" 
              className="mt-4 sm:mt-6"
            >
              <Suspense fallback={
                <div className="text-center p-4 text-sm sm:text-base text-muted-foreground">
                  Siparişler yükleniyor...
                </div>
              }>
                <TabAwaitingOrders />
              </Suspense>
            </TabsContent>
            
            <TabsContent 
              value="accepted" 
              className="mt-4 sm:mt-6"
            >
              <Suspense fallback={
                <div className="text-center p-4 text-sm sm:text-base text-muted-foreground">
                  Siparişler yükleniyor...
                </div>
              }>
                <TabAcceptedOrders />
              </Suspense>
            </TabsContent>
            
            <TabsContent 
              value="completed" 
              className="mt-4 sm:mt-6"
            >
              <Suspense fallback={
                <div className="text-center p-4 text-sm sm:text-base text-muted-foreground">
                  Siparişler yükleniyor...
                </div>
              }>
                <TabCompletedOrders />
              </Suspense>
            </TabsContent>
            
            <TabsContent 
              value="offers" 
              className="mt-4 sm:mt-6"
            >
              <Suspense fallback={
                <div className="text-center p-4 text-sm sm:text-base text-muted-foreground">
                  Teklifler yükleniyor...
                </div>
              }>
                <GridClinicOffers />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
     
      </main>
    </div>
  );
}
