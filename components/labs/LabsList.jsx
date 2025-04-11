"use client"

import { useState, useTransition, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getLaboratories } from "@/app/_actions/laboratory"
import { Package, ChevronsUpDown, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function LabsList() {
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [labs, setLabs] = useState([])
  const [allMaterials, setAllMaterials] = useState([])
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  // Get unique materials from all labs' inventories
  useEffect(() => {
    const materials = new Set()
    labs.forEach(lab => {
      lab.inventory?.forEach(item => {
        materials.add(JSON.stringify({ 
          id: item.materialId,
          name: item.name,
          category: item.category 
        }))
      })
    })
    setAllMaterials(Array.from(materials).map(m => JSON.parse(m)))
  }, [labs])

  const fetchLabs = async (city) => {
    try {
      const data = await getLaboratories(city === "all" ? null : city)
      setLabs(data)
      setError(null)
    } catch (err) {
      setError("Laboratuvar listesi yüklenirken bir hata oluştu.")
      setLabs([])
    }
  }

  useEffect(() => {
    fetchLabs("all")
  }, [])

  const handleCityChange = (city) => {
    setSelectedCity(city)
    startTransition(() => {
      fetchLabs(city)
    })
  }

  // Update the filtering logic for multiple materials
  const filteredLabs = selectedMaterials.length > 0
    ? labs.filter(lab => 
        lab.inventory?.some(item => 
          selectedMaterials.includes(item.materialId)
        )
      )
    : labs

  const cities = labs ? [...new Set(labs.map(lab => lab.city))].sort() : []

  // Helper function to group materials by category
  const groupMaterialsByCategory = (materials) => {
    return materials.reduce((acc, material) => {
      const category = material.category || 'Diğer'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(material)
      return acc
    }, {})
  }

  // Helper function to toggle material selection
  const toggleMaterial = (materialId) => {
    setSelectedMaterials(current => 
      current.includes(materialId)
        ? current.filter(id => id !== materialId)
        : [...current, materialId]
    )
  }

  if (error) {
    return (
      <Card className="p-8">
        <p className="text-center text-red-500">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters Section */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        {/* Clear Filters Button */}
        <div className="order-2 sm:order-1">
          {selectedMaterials.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMaterials([])}
              className="w-full sm:w-auto text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
            >
              <Package className="mr-2 h-4 w-4 hidden sm:inline-block" />
              <span className="truncate">
                {selectedMaterials.length} malzeme seçili
              </span>
              <span className="sr-only">Filtreleri temizle</span>
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 order-1 sm:order-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full sm:w-[200px] md:w-[250px] lg:w-[300px] justify-between"
              >
                <span className="truncate">
                  {selectedMaterials.length > 0
                    ? `${selectedMaterials.length} malzeme seçildi`
                    : "Malzeme seçin..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[200px] md:w-[250px] lg:w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Malzeme ara..." className="h-9" />
                <CommandEmpty>Malzeme bulunamadı.</CommandEmpty>
                <ScrollArea className="h-[250px] sm:h-[300px] overflow-auto">
                  {Object.entries(groupMaterialsByCategory(allMaterials)).map(([category, materials]) => (
                    <CommandGroup key={category} heading={category} className="px-3 py-2">
                      {materials.map((material) => (
                        <CommandItem
                          key={material.id}
                          value={material.name}
                          className="flex items-center px-2 py-1.5 text-black cursor-pointer rounded-sm hover:bg-muted/50"
                          onSelect={() => toggleMaterial(material.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 flex-shrink-0",
                              selectedMaterials.includes(material.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="flex-1 truncate">{material.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </ScrollArea>
              </Command>
            </PopoverContent>
          </Popover>

          {/* City Filter */}
          <Select value={selectedCity} onValueChange={handleCityChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Şehir seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Şehirler</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Labs Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {isPending ? (
          <Card className="p-4 sm:p-6 md:p-8 col-span-full">
            <p className="text-center text-muted-foreground">Yükleniyor...</p>
          </Card>
        ) : filteredLabs.length === 0 ? (
          <Card className="p-4 sm:p-6 md:p-8 col-span-full">
            <p className="text-center text-muted-foreground">
              {selectedMaterials.length > 0
                ? "Seçilen malzemeleri sunan laboratuvar bulunamadı."
                : "Laboratuvar bulunamadı."}
            </p>
          </Card>
        ) : (
          filteredLabs.map(lab => (
            <Card key={lab.id} className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Lab Info Section */}
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">{lab.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{lab.city}</p>
                  <p className="text-xs sm:text-sm mt-2">{lab.email}</p>
                </div>

                <Separator />

                {/* Materials Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm sm:text-base">
                      Malzeme ve Fiyat Listesi
                    </h4>
                    <Badge variant="secondary" className="ml-auto">
                      {lab.inventory?.length || 0} malzeme
                    </Badge>
                  </div>

                  {lab.inventory && lab.inventory.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {Object.entries(groupMaterialsByCategory(lab.inventory)).map(([category, items]) => (
                        <div key={category}>
                          <h5 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                            {category}
                          </h5>
                          <div className="space-y-2">
                            {items.map(item => (
                              <div 
                                key={item.materialId}
                                className="flex items-center justify-between rounded-md border p-2 sm:p-2.5 text-xs sm:text-sm hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{item.name}</p>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className="ml-2 sm:ml-4 shrink-0 bg-green-50 text-green-700 border-green-200 font-medium"
                                >
                                  {item.price.toLocaleString('tr-TR')} TL
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6 text-xs sm:text-sm text-muted-foreground">
                      <p>Henüz malzeme eklenmemiş</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 