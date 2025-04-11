"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { getMaterial } from "@/app/_actions/materials"

function MaterialEntry({ material, onRemove }) {
  const [materialDetails, setMaterialDetails] = useState(null)

  useEffect(() => {
    async function fetchMaterialDetails() {
      try {
        const materialData = await getMaterial(material.materialId)
        setMaterialDetails(materialData)
      } catch (error) {
        console.error('Malzeme detayları getirilemedi:', error)
      }
    }

    fetchMaterialDetails()
  }, [material.materialId])

  return (
    <Card className="p-4 relative">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">
            {materialDetails ? materialDetails.name : 'Yükleniyor...'}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      {material.quantity && (
        <div className="mt-2 text-sm text-muted-foreground">
          <p className="font-medium">Adet:</p>
          <p>{material.quantity} adet</p>
        </div>
      ) }
        
        {material.notes && (
          <div className="mt-2 text-sm text-muted-foreground">
            <p className="font-medium">Notlar:</p>
            <p>{material.notes}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default MaterialEntry 