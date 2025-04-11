import { UserCircle } from "lucide-react"

export default function HeaderLabs({ user }) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Laboratuvar Listesi</h1>
          
          <div className="flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            <span className="text-sm text-muted-foreground">{user.fullName}</span>
          </div>
        </div>
      </div>
    </header>
  )
} 