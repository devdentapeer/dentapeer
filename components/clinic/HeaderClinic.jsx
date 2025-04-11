import { Bell, Settings } from "lucide-react"
import ButtonNewOrder from "../order/ButtonNewOrder"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import ButtonLogout from "../auth/ButtonLogout"
import Link from "next/link";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
export default function HeaderClinic() {
  return (
    <header className="sticky top-0 z-50 w-full border-b flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex w-full items-center justify-between">
          <Link href="/clinic" className="font-semibold">Dentapeer</Link>
          <div className="flex items-center gap-x-4">
            <ButtonNewOrder />
            <NotificationsDropdown />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
               <ButtonLogout />
              </DropdownMenuContent>
            </DropdownMenu>                
            
          </div>
        </div>
      </div>
    </header>
  )
} 