"use server"

import { auth } from "@/auth"
import dbConnect from "@/libs/mongoose"
import Message from "@/models/Message"
import Order from "@/models/Order"
import { revalidatePath } from "next/cache"
import Offer from "@/models/Offer"

class NotificationActionError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "NotificationActionError"
    this.status = status
  }
}

export async function getUnseenMessages() {
  const { user } = await auth()
  if (!user) throw new NotificationActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    let orders = []

    if (user.role === "diş_kliniği") {
      // For clinics: Find orders they created
      orders = await Order.find({ 
        clinicId: user.id 
      }).select('_id title')
    } else if (user.role === "laboratuvar") {
      // For labs: Find orders where their offer was accepted
      const acceptedOffers = await Offer.find({
        offeredBy: user.id,
        status: "kabul_edildi"
      }).select('orderId')

      orders = await Order.find({
        _id: { $in: acceptedOffers.map(offer => offer.orderId) }
      }).select('_id title')
    }

    if (!orders.length) return []

    // Get unseen messages for these orders
    const unseenMessages = await Message.find({
      orderId: { $in: orders.map(o => o._id) },
      senderId: { $ne: user.id }, // Exclude messages sent by current user
      read: false
    })
    .populate('senderId', 'fullName role')
    .populate('orderId', 'title')
    .sort({ createdAt: -1 })
    .lean()

    return unseenMessages.map(message => ({
      id: message._id.toString(),
      content: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
      sender: {
        name: message.senderId.fullName,
        role: message.senderId.role
      },
      order: {
        id: message.orderId._id.toString(),
        title: message.orderId.title
      },
      createdAt: message.createdAt.toISOString()
    }))
  } catch (error) {
    console.error("Okunmamış mesajları getirme hatası:", error)
    throw new NotificationActionError("Mesajlar getirilemedi", 500)
  }
}

export async function markMessageAsSeen(messageId) {
  const { user } = await auth()
  if (!user) throw new NotificationActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    ).populate('orderId', '_id')

    if (!message) {
      throw new NotificationActionError("Mesaj bulunamadı", 404)
    }

    // Revalidate paths after the update
    if (message.orderId) {
      revalidatePath(`/orders/${message.orderId._id}`)
      revalidatePath('/', 'layout') // Revalidate the notification count in the header
    }

    return { success: true }
  } catch (error) {
    console.error("Mesaj okundu işaretleme hatası:", error)
    throw new NotificationActionError("Mesaj güncellenemedi", 500)
  }
} 