import { CheckCircle2, Circle, Clock } from "lucide-react"

const statuses = [
  { id: "teklif_kabul_edildi", label: "Teklif Kabul Edildi" },
  { id: "uretimde", label: "Üretimde" },
  { id: "gonderime_hazir", label: "Gönderime Hazır" },
  { id: "kargoda", label: "Kargoda" },
  { id: "teslim_edildi", label: "Teslim Edildi" }
]

const statusIndex = {
  "teklif_kabul_edildi": 0,
  "uretimde": 1,
  "gonderime_hazir": 2,
  "kargoda": 3,
  "teslim_edildi": 4,
  "iptal_edildi": -1 // Special case
}

export default function OrderStatusTracker({ currentStatus }) {
  if (currentStatus === "iptal_edildi") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
        <p className="text-lg font-semibold">Bu sipariş iptal edilmiştir</p>
      </div>
    )
  }

  const currentIndex = statusIndex[currentStatus] ?? 0

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {statuses.map((status, index) => {
          // Determine the state of this step
          const isComplete = index <= currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={status.id} className="flex flex-col items-center">
              <div className="flex items-center">
                {/* Line before first step is not needed */}
                {index > 0 && (
                  <div 
                    className={`h-1 w-12 md:w-24 lg:w-32 ${
                      index <= currentIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
                
                {/* Step indicator */}
                <div className={`flex h-8 w-8 items-center justify-center rounded-full
                  ${isCurrent 
                    ? "border-2 border-primary bg-background" 
                    : isComplete 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"}`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Clock className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                
                {/* Line after last step is not needed */}
                {index < statuses.length - 1 && (
                  <div 
                    className={`h-1 w-12 md:w-24 lg:w-32 ${
                      index < currentIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
              
              <span className={`mt-2 text-xs font-medium md:text-sm
                ${isCurrent ? "text-primary" : "text-muted-foreground"}`}
              >
                {status.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 