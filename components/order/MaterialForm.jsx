"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { getMaterials } from "@/app/_actions/materials"

function MaterialForm({ material, onChange, onAdd }) {
  const [materials, setMaterials] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const materialsData = await getMaterials()
        
        // Group materials by category
        const groupedMaterials = materialsData.reduce((acc, material) => {
          const category = material.category || 'Diğer'
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(material)
          return acc
        }, {})

        setMaterials(groupedMaterials)
      } catch (error) {
        toast.error('Malzemeler yüklenemedi')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label>Malzeme</Label>
          <Select
            value={material.materialId}
            onValueChange={(value) => onChange({ ...material, materialId: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Yükleniyor..." : "Malzeme seçin"} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(materials).map(([category, categoryMaterials]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-white bg-muted">
                    {category}
                  </div>
                  {categoryMaterials.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Adet</Label>
          <Input
            type="number"
            value={material.quantity || ""}
            onChange={(e) => onChange({ ...material, quantity: e.target.value })}
            placeholder="Adet"
          />
        </div>

        <div>
          <Label>Notlar</Label>
          <Input
            value={material.notes}
            onChange={(e) => onChange({ ...material, notes: e.target.value })}
            placeholder="Malzeme ile ilgili notlar"
          />
        </div>

        <Button
          type="button"
          onClick={onAdd}
          disabled={!material.materialId}
          className="w-full"
        >
          Malzeme Ekle
        </Button>
      </div>
    </Card>
  )
}

export default MaterialForm 