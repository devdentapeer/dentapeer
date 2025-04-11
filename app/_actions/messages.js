"use server"

import { auth } from "@/auth"
import dbConnect from "@/libs/mongoose"
import Message from "@/models/Message"
import { pusher } from "@/libs/pusher"
import { revalidatePath } from "next/cache"

class MessageActionError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "MessageActionError"
    this.status = status
  }
}

export async function sendMessage(orderId, content) {
  const { user } = await auth()
  if (!user) throw new MessageActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    const message = await Message.create({
      orderId,
      senderId: user.id,
      content
    })

    // Populate sender details
    await message.populate('senderId', 'fullName role')

    const messageData = {
      id: message._id.toString(),
      content: message.content,
      sender: {
        id: message.senderId._id.toString(),
        name: message.senderId.fullName,
        role: message.senderId.role
      },
      createdAt: message.createdAt.toISOString(),
      read: message.read
    }

    // Trigger Pusher event
    await pusher.trigger(`order-${orderId}`, 'new-message', messageData)

    revalidatePath(`/orders/${orderId}`)
    return messageData

  } catch (error) {
    console.error("Mesaj gönderme hatası:", error)
    throw new MessageActionError("Mesaj gönderilemedi", 500)
  }
}

export async function getMessages(orderId) {
  const { user } = await auth()
  if (!user) throw new MessageActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    const messages = await Message.find({ orderId })
      .populate('senderId', 'fullName role')
      .sort({ createdAt: 1 })
      .lean()

    return messages.map(message => ({
      id: message._id.toString(),
      content: message.content,
      sender: {
        id: message.senderId._id.toString(),
        name: message.senderId.fullName,
        role: message.senderId.role
      },
      createdAt: message.createdAt.toISOString(),
      read: message.read
    }))
  } catch (error) {
    console.error("Mesajları getirme hatası:", error)
    throw new MessageActionError("Mesajlar getirilemedi", 500)
  }
} 