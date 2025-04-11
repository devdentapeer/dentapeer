import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function CardClinicStats({ title, value, trend, icon, trendUp }) {
  return (
    <Card className="hover-card bg-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-secondary">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`flex items-center text-sm ${
                  trendUp ? "text-success" : "text-error"
                }`}
              >
                {trend}
              </span>
              <svg
                className={`h-4 w-4 ${trendUp ? "text-green-600" : "text-red-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {trendUp ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
                  />
                )}
              </svg>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CardClinicStats 