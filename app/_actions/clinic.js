"use server"

import { auth } from "@/auth"
import dbConnect from "@/libs/mongoose"
import Order from "@/models/Order"
import OrderMaterial from "@/models/OrderMaterial"
import Material from "@/models/Material"
import { revalidatePath } from "next/cache"
import Offer from "@/models/Offer"

class ClinicActionError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "ClinicActionError"
    this.status = status
  }
}

export async function getClinicStats() {
  const { user } = await auth()
  if (!user || user.role !== "diş_kliniği") {
    throw new ClinicActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    const clinicId = user.id

    const [totalOrders, pendingOffers, completedOrders] = await Promise.all([
      Order.countDocuments({ 
        clinicId, 
        status: { $ne: "teslim_edildi" } 
      }),
      Offer.countDocuments({ 
        receivedBy: clinicId, 
        status: "bekleniyor" 
      }),
      Order.countDocuments({ 
        clinicId, 
        status: "teslim_edildi" 
      })
    ])

    return {
      totalOrders,
      pendingOffers,
      completedOrders
    }
  } catch (error) {
    console.error("İstatistik alınamadı:", error)
    throw new ClinicActionError("İstatistik alınamadı", 500)
  }
}

export async function getClinicOrders() {
  const { user } = await auth()
  if (!user || user.role !== "diş_kliniği") {
    throw new ClinicActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    const orders = await Order.find({ clinicId: user.id })
      .sort({ createdAt: -1 })

    // Fetch materials for each order
    const ordersWithMaterials = await Promise.all(
      orders.map(async (order) => {
        const orderMaterials = await OrderMaterial.find({ orderId: order._id })
          .populate("materialId", "name description category")

        // Convert each orderMaterial and its populated materialId to JSON
        const materialsJSON = orderMaterials.map(om => ({
          ...om.toJSON(),
          materialId: om.materialId.toJSON()
        }))

        return {
          ...order.toJSON(),
          materials: materialsJSON
        }
      })
    )

    return ordersWithMaterials
  } catch (error) {
    console.error("Siparişleri getirme hatası:", error)
    throw new ClinicActionError("Siparişleri getirme hatası", 500)
  }
}

export async function getClinicOrdersWithUpdates() {
  const { user } = await auth()
  if (!user || user.role !== "diş_kliniği") {
    throw new ClinicActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    const orders = await Order.find({ 
      clinicId: user.id,
      status: { 
        $in: ["teklif_bekleniyor", "uretimde", "gonderime_hazir", "kargoda"] 
      }
    })
    .sort({ updatedAt: -1 })
    .limit(5)

    // Fetch materials for each order
    const ordersWithMaterials = await Promise.all(
      orders.map(async (order) => {
        const orderMaterials = await OrderMaterial.find({ orderId: order._id })
          .populate("materialId", "name description category")

        // Convert each orderMaterial and its populated materialId to JSON
        const materialsJSON = orderMaterials.map(om => ({
          ...om.toJSON(),
          materialId: om.materialId.toJSON()
        }))

        return {
          ...order.toJSON(),
          materials: materialsJSON
        }
      })
    )

    return ordersWithMaterials
  } catch (error) {
    console.error("Güncel siparişleri getirme hatası:", error)
    throw new ClinicActionError("Güncel siparişleri getirme hatası", 500)
  }
}

export async function getAwaitingOrders() {
  const { user } = await auth()
  if (!user || user.role !== "diş_kliniği") {
    throw new ClinicActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    const orders = await Order.find({ 
      clinicId: user.id,
      status: "teklif_bekleniyor"
    })
    .sort({ createdAt: -1 })
    .populate("clinicId", "name")
    .lean()

    return orders.map(order => ({
      id: order._id.toString(),
      title: order.title,
      description: order.description,
      status: order.status,
      createdAt: order.createdAt.toISOString()
    }))
  } catch (error) {
    console.error("Bekleyen siparişleri getirme hatası:", error)
    throw new ClinicActionError("Bekleyen siparişleri getirme hatası", 500)
  }
}

export async function getAcceptedOrders() {
  const { user } = await auth()
  if (!user || user.role !== "diş_kliniği") {
    throw new ClinicActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    // First, find all accepted offers for this clinic
    const offers = await Offer.find({ 
      receivedBy: user.id,
      status: "kabul_edildi"
    }).lean()

    // Get all order IDs from accepted offers
    const orderIds = offers.map(offer => offer.orderId)

    // Find orders with these IDs and in production states
    const orders = await Order.find({ 
      _id: { $in: orderIds },
      status: { 
        $in: ["teklif_kabul_edildi", "uretimde", "gonderime_hazir", "kargoda"] 
      }
    })
    .sort({ updatedAt: -1 })
    .lean()

    // Create a map of offers for easy lookup
    const offerMap = offers.reduce((acc, offer) => {
      acc[offer.orderId.toString()] = offer
      return acc
    }, {})

    // Combine order and offer data
    return orders.map(order => {
      const relatedOffer = offerMap[order._id.toString()]
      return {
        id: order._id.toString(),
        title: order.title,
        description: order.description,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt?.toISOString() || order.createdAt.toISOString(),
        price: relatedOffer?.price || 0,
        deliveryTime: relatedOffer?.deliveryTime || 'Belirtilmemiş'
      }
    })
  } catch (error) {
    console.error("Onaylanan siparişleri getirme hatası:", error)
    throw new ClinicActionError("Onaylanan siparişleri getirme hatası", 500)
  }
}

export async function getCompletedOrders() {
  const { user } = await auth()
  if (!user || user.role !== "diş_kliniği") {
    throw new ClinicActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    // Find completed orders with their accepted offers
    const orders = await Order.find({ 
      clinicId: user.id,
      status: "teslim_edildi"
    })
    .sort({ updatedAt: -1 })
    .lean()

    // Get accepted offers for these orders
    const offers = await Offer.find({
      orderId: { $in: orders.map(order => order._id) },
      status: "kabul_edildi"
    })
    .populate('offeredBy', 'fullName')
    .lean()

    // Create offers lookup map
    const offerMap = offers.reduce((acc, offer) => {
      acc[offer.orderId.toString()] = offer
      return acc
    }, {})

    return orders.map(order => {
      const relatedOffer = offerMap[order._id.toString()]
      return {
        id: order._id.toString(),
        title: order.title,
        description: order.description,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt?.toISOString() || order.createdAt.toISOString(),
        completedAt: order.completedAt?.toISOString() || order.updatedAt?.toISOString(),
        price: relatedOffer?.price || 0,
        deliveryTime: relatedOffer?.deliveryTime || 'Belirtilmemiş',
        laboratoryName: relatedOffer?.offeredBy?.fullName || 'Bilinmiyor'
      }
    })
  } catch (error) {
    console.error("Tamamlanan siparişleri getirme hatası:", error)
    throw new ClinicActionError("Tamamlanan siparişleri getirme hatası", 500)
  }
} 