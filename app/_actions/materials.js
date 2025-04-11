"use server"

import dbConnect from "@/libs/mongoose"
import Material from "@/models/Material"

class MaterialActionError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "MaterialActionError"
    this.status = status
  }
}

export async function getMaterials() {
  await dbConnect()

  try {
    const materials = await Material.find()
      .sort({ category: 1, name: 1 })
      .lean()
    
    return materials.map(material => ({
      id: material._id.toString(),
      name: material.name,
      category: material.category,
      description: material.description
    }))
  } catch (error) {
    console.error("Malzemeleri getirme hatası:", error)
    throw new MaterialActionError("Malzemeleri getirme hatası", 500)
  }
}

export async function getMaterial(id) {
  await dbConnect()

  try {
    const material = await Material.findById(id).lean()
    if (!material) {
      throw new MaterialActionError("Malzeme bulunamadı", 404)
    }
    
    return {
      id: material._id.toString(),
      name: material.name,
      category: material.category,
      description: material.description
    }
  } catch (error) {
    console.error("Malzeme getirme hatası:", error)
    throw new MaterialActionError("Malzeme getirme hatası", 500)
  }
} 