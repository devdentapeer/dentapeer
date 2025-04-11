"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getMaterials } from "@/app/_actions/materials"
import { getLabInventory, updateLabInventory } from "@/app/_actions/laboratory-inventory"
import { useRouter } from "next/navigation"
import { Package } from "lucide-react"

export default function FormInventory({ labId }) {
  const router = useRouter()
  const [materials, setMaterials] = useState([])
  const [groupedMaterials, setGroupedMaterials] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  // Helper function to group materials
  const groupMaterials = (materialsList) => {
    return materialsList.reduce((acc, material) => {
      const category = material.category || 'Diğer'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(material)
      return acc
    }, {})
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [allMaterials, inventory] = await Promise.all([
          getMaterials(),
          getLabInventory(labId)
        ])

        const priceMap = new Map(
          inventory.map(item => [item.materialId, item.price])
        )

        const materialsWithState = allMaterials.map(material => ({
          ...material,
          isSelected: priceMap.has(material.id),
          price: priceMap.get(material.id) || 0
        }))

        setMaterials(materialsWithState)
        setGroupedMaterials(groupMaterials(materialsWithState))
      } catch (error) {
        toast.error("Veriler yüklenirken bir hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [labId])

  const handleToggleMaterial = (materialId) => {
    const updatedMaterials = materials.map(material => 
      material.id === materialId 
        ? { ...material, isSelected: !material.isSelected }
        : material
    )
    setMaterials(updatedMaterials)
    setGroupedMaterials(groupMaterials(updatedMaterials))
  }

  const handlePriceChange = (materialId, price) => {
    const updatedMaterials = materials.map(material =>
      material.id === materialId
        ? { ...material, price: parseFloat(price) || 0 }
        : material
    )
    setMaterials(updatedMaterials)
    setGroupedMaterials(groupMaterials(updatedMaterials))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const selectedItems = materials
        .filter(m => m.isSelected)
        .map(m => ({
          materialId: m.id,
          price: m.price
        }))

      await updateLabInventory(selectedItems)
      toast.success("Envanter başarıyla güncellendi")
      router.push("/laboratory")
    } catch (error) {
      toast.error("Envanter güncellenirken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mevcut Malzemeler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {Object.entries(groupedMaterials).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    {category}
                  </h3>
                  <div className="grid gap-3">
                    {items.map(material => (
                      <div 
                        key={material.id}
                        className="flex items-center justify-between gap-4 rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <input
                                type="checkbox"
                                checked={material.isSelected}
                                onChange={() => handleToggleMaterial(material.id)}
                                className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium">{material.name}</h4>
                              {material.description && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {material.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {material.isSelected && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={material.price}
                              onChange={(e) => handlePriceChange(material.id, e.target.value)}
                              className="w-32"
                              placeholder="Fiyat"
                            />
                            <span className="text-sm text-muted-foreground">TL</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      </div>
    </form>
  )
} 