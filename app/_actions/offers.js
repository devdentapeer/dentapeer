"use server"

import { auth } from "@/auth"
import dbConnect from "@/libs/mongoose"
import Offer from "@/models/Offer"
import Order from "@/models/Order"
import { revalidatePath } from "next/cache"

class OfferActionError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "OfferActionError"
    this.status = status
  }
}

export async function createOffer(formData) {
  const { user } = await auth()
  if (!user) throw new OfferActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    const { orderId, price, deliveryTime } = formData

    // Check for existing offer
    const existingOffer = await Offer.findOne({
      orderId,
      offeredBy: user.id,
      status: "bekleniyor"
    })

    if (existingOffer) {
      throw new OfferActionError("Bu sipariş için bekleyen teklifiniz bulunmaktadır", 400)
    }

    if (!orderId || !price || !deliveryTime) {
      throw new OfferActionError("Eksik alanlar", 400)
    }

    // Get order with clinic details and convert to plain object
    const order = await Order.findById(orderId)
      .populate("clinicId", "role")
      .lean()

    if (!order) {
      throw new OfferActionError("Sipariş bulunamadı", 404)
    }

    if (order.status !== "teklif_bekleniyor") {
      throw new OfferActionError("Bu sipariş için teklif verilemez", 400)
    }

    // Determine receiver based on user role
    let receiverId
    if (user.role === "laboratuvar" && order.clinicId.role === "diş_kliniği") {
      receiverId = order.clinicId._id.toString()
    } else if (user.role === "diş_kliniği" && order.clinicId.role === "laboratuvar") {
      receiverId = order.clinicId._id.toString()
    } else {
      throw new OfferActionError("Aynı role sahip kullanıcılar birbirlerine teklif veremez", 403)
    }

    const newOffer = await Offer.create({
      orderId,
      offeredBy: user.id,
      receivedBy: receiverId,
      price: parseFloat(price),
      deliveryTime,
      status: "bekleniyor"
    })

    // Convert to plain object before returning
    const plainOffer = {
      id: newOffer._id.toString(),
      orderId: newOffer.orderId.toString(),
      offeredBy: newOffer.offeredBy.toString(),
      receivedBy: newOffer.receivedBy.toString(),
      price: newOffer.price,
      deliveryTime: newOffer.deliveryTime,
      status: newOffer.status,
      createdAt: newOffer.createdAt.toISOString()
    }

    revalidatePath("/laboratory/offers")
    revalidatePath("/clinic/offers")
    return plainOffer

  } catch (error) {
    console.error("Teklif oluşturma hatası:", error)
    throw new OfferActionError(error.message || "Sunucu hatası", error.status || 500)
  }
}

export async function getSentOffers() {
  const { user } = await auth()
  if (!user) throw new OfferActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    const offers = await Offer.find({ offeredBy: user.id })
      .populate("orderId", "materialId quantity status")
      .populate("receivedBy", "fullName email")
      .sort({ createdAt: -1 })
      .lean()

    return offers
  } catch (error) {
    console.error("Teklifleri getirme hatası:", error)
    throw new OfferActionError("Sunucu hatası", 500)
  }
}

export async function getReceivedOffers() {
  const { user } = await auth()
  if (!user) throw new OfferActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    const offers = await Offer.find({ receivedBy: user.id })
      .populate("orderId", "materialId quantity status")
      .populate("offeredBy", "fullName email")
      .sort({ createdAt: -1 })
      .lean()

    return offers
  } catch (error) {
    console.error("Teklifleri getirme hatası:", error)
    throw new OfferActionError("Sunucu hatası", 500)
  }
}

const validOfferStatuses = ["kabul_edildi", "reddedildi", "iptal_edildi"]

export async function updateOfferStatus(offerId, status) {
  const { user } = await auth()
  if (!user) throw new OfferActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    if (!validOfferStatuses.includes(status)) {
      throw new OfferActionError("Geçersiz teklif durumu", 400)
    }

    const offer = await Offer.findById(offerId).populate("orderId")
    if (!offer) {
      throw new OfferActionError("Teklif bulunamadı", 404)
    }

    if (offer.receivedBy.toString() !== user.id) {
      throw new OfferActionError("Bu teklifi güncelleme yetkiniz yok", 403)
    }

    if (offer.status !== "bekleniyor") {
      throw new OfferActionError("Bu teklif zaten işleme alınmış", 400)
    }

    offer.status = status
    await offer.save()

    if (status === "kabul_edildi") {
      await Order.findByIdAndUpdate(offer.orderId._id, {
        status: "teklif_kabul_edildi"
      })

      // Reject all other pending offers for this order
      await Offer.updateMany(
        {
          orderId: offer.orderId._id,
          _id: { $ne: offerId },
          status: "bekleniyor"
        },
        { status: "reddedildi" }
      )
    }

    revalidatePath("/laboratory/offers")
    revalidatePath("/clinic/offers")
    return offer
  } catch (error) {
    console.error("Teklif güncelleme hatası:", error)
    throw new OfferActionError(error.message || "Sunucu hatası", error.status || 500)
  }
}

export async function getClinicOffers() {
  const { user } = await auth()
  if (!user || user.role !== "diş_kliniği") {
    throw new OfferActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    // Find orders created by this clinic
    const orders = await Order.find({ clinicId: user.id }).lean()
    
    // Find offers for these orders
    const offers = await Offer.find({
      orderId: { $in: orders.map(order => order._id) }
    })
    .populate('orderId', 'title description')
    .populate('offeredBy', 'fullName')
    .sort({ createdAt: -1 })
    .lean()

    return offers.map(offer => ({
      id: offer._id.toString(),
      orderId: offer.orderId?._id.toString(),  // Include the orderId for navigation
      orderTitle: offer.orderId?.title || "Silinmiş Sipariş",
      orderDescription: offer.orderId?.description || "",
      laboratory: offer.offeredBy?.fullName || "Bilinmeyen Laboratuvar",
      price: offer.price,
      deliveryTime: offer.deliveryTime,
      status: offer.status,
      createdAt: offer.createdAt.toISOString()
    }))
  } catch (error) {
    console.error("Teklifleri getirme hatası:", error)
    throw new OfferActionError("Teklifleri getirme hatası", 500)
  }
}

export async function checkExistingOffer(orderId) {
  const { user } = await auth()
  if (!user) throw new OfferActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    const existingOffer = await Offer.findOne({
      orderId,
      offeredBy: user.id,
      status: { $in: ["bekleniyor", "kabul_edildi"] } // Only check for pending or accepted offers
    }).lean()

    if (!existingOffer) return null

    return {
      id: existingOffer._id.toString(),
      status: existingOffer.status,
      price: existingOffer.price,
      deliveryTime: existingOffer.deliveryTime,
      createdAt: existingOffer.createdAt.toISOString()
    }
  } catch (error) {
    console.error("Teklif kontrol hatası:", error)
    throw new OfferActionError("Teklif kontrol hatası", 500)
  }
}

export async function getLabOffers() {
  const { user } = await auth()
  if (!user || user.role !== "laboratuvar") {
    throw new OfferActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    const offers = await Offer.find({ offeredBy: user.id })
      .populate('orderId', 'title description status')
      .populate('receivedBy', 'fullName')
      .sort({ createdAt: -1 })
      .lean()

    return offers.map(offer => ({
      id: offer._id.toString(),
      orderId: offer.orderId?._id.toString(),
      orderTitle: offer.orderId?.title || "Silinmiş Sipariş",
      orderDescription: offer.orderId?.description || "",
      orderStatus: offer.orderId?.status || "silinmiş",
      clinic: offer.receivedBy?.fullName || "Bilinmeyen Klinik",
      price: offer.price,
      deliveryTime: offer.deliveryTime,
      status: offer.status,
      createdAt: offer.createdAt.toISOString()
    }))
  } catch (error) {
    console.error("Teklifleri getirme hatası:", error)
    throw new OfferActionError("Teklifleri getirme hatası", 500)
  }
} 