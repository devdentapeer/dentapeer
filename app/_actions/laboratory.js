"use server"

import { auth } from "@/auth"
import Order from "@/models/Order"
import OrderMaterial from "@/models/OrderMaterial"
import Material from "@/models/Material"
import dbConnect from "@/libs/mongoose"
import User from "@/models/User"
import LabInventory from "@/models/LabInventory"

class LabActionError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "LabActionError"
    this.status = status
  }
}

export async function getLabOpenOrders() {
  const { user } = await auth()
  if (!user || user.role !== "laboratuvar") {
    throw new LabActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    // First get all open orders
    const orders = await Order.find({ 
      status: "teklif_bekleniyor" 
    })
    .populate({
      path: 'clinicId',
      select: 'fullName email'
    })
    .lean()

    if (!orders) {
      return []
    }

    // Get materials for each order
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
      // Find order materials with their material details
      const orderMaterials = await OrderMaterial.find({ 
        orderId: order._id 
      })
      .populate({
        path: 'materialId',
        model: Material,
        select: 'name category description'
      })
      .lean()

      // Format the response
      return {
        id: order._id.toString(),
        title: order.title || "",
        description: order.description || "",
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt?.toISOString() || order.createdAt.toISOString(),
        clinic: {
          id: order.clinicId?._id.toString(),
          name: order.clinicId?.fullName || "Bilinmeyen Klinik",
          email: order.clinicId?.email
        },
        materials: orderMaterials.map(material => ({
          id: material._id.toString(),
          name: material.materialId?.name || "Bilinmeyen Malzeme",
          category: material.materialId?.category || "Diğer",
          description: material.materialId?.description || "",
          quantity: material.quantity || 0,
          notes: material.notes || ""
        }))
      }
    }))

    // Sort by creation date, newest first
    return ordersWithDetails.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )

  } catch (error) {
    console.error("Açık siparişleri getirme hatası:", error)
    if (error.name === "LabActionError") {
      throw error
    }
    throw new LabActionError(
      error.message || "Siparişleri getirme hatası", 
      error.status || 500
    )
  }
}

export async function getLaboratories(city = null) {
  const { user } = await auth()
  if (!user || user.role !== "diş_kliniği") {
    throw new LabActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    const query = { role: "laboratuvar" }
    if (city) {
      query.city = city
    }

    const labs = await User.find(query)
      .select('fullName email city')
      .sort({ fullName: 1 })
      .lean()

    // Fetch inventory for each laboratory
    const labsWithInventory = await Promise.all(labs.map(async (lab) => {
      const inventory = await LabInventory.find({ labId: lab._id })
        .populate('materialId', 'name category description') // Populate material details
        .lean()

      return {
        id: lab._id.toString(),
        name: lab.fullName,
        email: lab.email,
        city: lab.city || "Belirtilmemiş",
        inventory: inventory.map(item => ({
          materialId: item.materialId._id.toString(),
          name: item.materialId.name,
          category: item.materialId.category || "Diğer",
          description: item.materialId.description,
          price: item.price
        }))
      }
    }))

    return labsWithInventory
  } catch (error) {
    console.error("Laboratuvar listesi getirme hatası:", error)
    throw new LabActionError("Laboratuvar listesi getirme hatası", 500)
  }
} 