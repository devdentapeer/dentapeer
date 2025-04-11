import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart3, ClipboardCheck, Clock } from "lucide-react";
import { getClinicStats } from "@/app/_actions/clinic";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default async function StatsDashboardClinic() {
  const stats = await getClinicStats();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Aktif Siparişler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {stats.totalOrders}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bekleyen Teklifler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {stats.pendingOffers}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tamamlanan Siparişler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            {stats.completedOrders}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
