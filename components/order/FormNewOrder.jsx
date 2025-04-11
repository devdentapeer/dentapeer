"use client"

import { createOrder } from "@/app/_actions/orders"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MaterialForm from "./MaterialForm"
import MaterialEntry from "./MaterialEntry"
import { UploadForm } from "@/components/laboratory/UploadForm"

function FormNewOrder() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    materials: [],
    modelUrl: ""
  })

  const [currentMaterial, setCurrentMaterial] = useState({
    materialId: "",
    quantity: 1,
    notes: ""
  })

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, currentMaterial]
    }))
    setCurrentMaterial({ materialId: "", quantity: 1, notes: "" })
  }

  const removeMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }))
  }

  const handleUploadComplete = (url) => {
    setFormData(prev => ({
      ...prev,
      modelUrl: url
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.materials || formData.materials.length === 0) {
        throw new Error("En az bir malzeme seçmelisiniz")
      }

      await createOrder(formData)
      toast.success("Sipariş başarıyla oluşturuldu")
      router.push("/clinic")
    } catch (error) {
      if (error.name === "OrderActionError") {
        toast.error(error.message)
      } else {
        toast.error("Bir hata oluştu")
      }
      
    } finally {
      setIsLoading(false)
    }
    }

 


  return (
    <Card className="max-w-2xl mx-auto">
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              placeholder="Başlık"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <Input
              placeholder="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
           
          </div>

          <div className="space-y-4">
            {formData.materials.map((material, index) => (
              <MaterialEntry
                key={index}
                material={material}
                onRemove={() => removeMaterial(index)}
              />
            ))}
          </div>

          <MaterialForm
            material={currentMaterial}
            onChange={setCurrentMaterial}
            onAdd={addMaterial}
          />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Model Dosyası</h3>
            <UploadForm onUploadComplete={handleUploadComplete} />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !formData.materials.length || !formData.title || !formData.description}
            className="w-full"
          >
            {isLoading ? "Gönderiliyor..." : "Siparişi Oluştur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormNewOrder 