"use server"

import { auth } from "@/auth"
import dbConnect from "@/libs/mongoose"
import LabInventory from "@/models/LabInventory"
import Material from "@/models/Material"

class InventoryActionError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "InventoryActionError"
    this.status = status
  }
}

// Get lab's inventory
export async function getLabInventory(labId) {
  const { user } = await auth()
  if (!user || (user.role !== "laboratuvar" && user._id.toString() !== labId)) {
    throw new InventoryActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    const inventory = await LabInventory.find({ labId })
      .populate('materialId')
      .lean()

    return inventory.map(item => ({
      id: item._id.toString(),
      materialId: item.materialId._id.toString(),
      name: item.materialId.name,
      category: item.materialId.category,
      description: item.materialId.description,
      price: item.price
    }))
  } catch (error) {
    console.error("Envanter getirme hatası:", error)
    throw new InventoryActionError("Envanter getirme hatası", 500)
  }
}

// Update lab's inventory
export async function updateLabInventory(materials) {
  const { user } = await auth()
  if (!user || user.role !== "laboratuvar") {
    throw new InventoryActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    // Remove all existing inventory items
    await LabInventory.deleteMany({ labId: user.id })

    // Add new inventory items
    const inventoryItems = materials.map(material => ({
      labId: user.id,
      materialId: material.materialId,
      price: material.price
    }))

    await LabInventory.insertMany(inventoryItems)

    return { success: true }
  } catch (error) {
    console.error("Envanter güncelleme hatası:", error)
    throw new InventoryActionError("Envanter güncelleme hatası", 500)
  }
} 