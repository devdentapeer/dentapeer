import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ButtonLogout from "@/components/auth/ButtonLogout"
import { Badge } from "../ui/badge"
import NotificationsDropdown from "../notifications/NotificationsDropdown"
import Link from "next/link"
import { Package } from "lucide-react"

export default function HeaderLaboratory({ user }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-x-4">
            <span className="font-semibold">{user.email}</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
              Laboratuvar
            </Badge>
          </div>

          <div className="flex items-center gap-x-4">
            <Link href={`/laboratory/${user.id}/inventory`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Malzeme Listesini Güncelle
              </Button>
            </Link>
            <NotificationsDropdown />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <ButtonLogout />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
} 