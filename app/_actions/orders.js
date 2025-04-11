"use server";

import { auth } from "@/auth";
import dbConnect from "@/libs/mongoose";
import Order from "@/models/Order";
import OrderMaterial from "@/models/OrderMaterial";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import Offer from "@/models/Offer";

class OrderActionError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "OrderActionError";
    this.status = status;
  }
}

export async function createOrder(formData) {
  const { user } = await auth();
  if (!user) throw new OrderActionError("Yetkisiz erişim", 401);
  if (user.role !== "diş_kliniği") {
    throw new OrderActionError("Sadece diş kliniği sipariş oluşturabilir", 403);
  }

  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, description, materials, modelUrl } = formData;

    if (!materials?.length) {
      throw new OrderActionError("En az bir malzeme gerekli", 400);
    }

    const [order] = await Order.create(
      [
        {
          clinicId: user.id,
          title,
          description,
          status: "teklif_bekleniyor",
          modelUrl
        },
      ],
      { session, ordered: true }
    );

    const orderMaterials = await OrderMaterial.create(
      materials.map((material) => ({
        orderId: order._id,
        materialId: material.materialId,
        quantity: material.quantity,
        notes: material.notes,
      })),
      { session, ordered: true }
    );

    await session.commitTransaction();
    revalidatePath("/clinic");

    // Transform the response to plain objects
    return {
      order: {
        id: order._id.toString(),
        clinicId: order.clinicId.toString(),
        title: order.title,
        description: order.description,
        status: order.status,
        modelUrl: order.modelUrl
      },
      materials: orderMaterials.map(material => ({
        id: material._id.toString(),
        orderId: material.orderId.toString(),
        materialId: material.materialId.toString(),
        quantity: material.quantity,
        notes: material.notes
      }))
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("HATA", error);
    throw new OrderActionError("Sunucu hatası", 500);
  } finally {
    session.endSession();
  }
}

export async function getOrders() {
  const { user } = await auth();
  if (!user) throw new OrderActionError("Yetkisiz erişim", 401);

  await dbConnect();

  try {
    let query = {};

    if (user.role === "laboratuvar") {
      query.status = "teklif_bekleniyor";
    } else if (user.role === "diş_kliniği") {
      query.clinicId = user.id;
    } else {
      throw new OrderActionError("Geçersiz rol", 403);
    }

    const orders = await Order.find(query)
      .populate("clinicId", "name email")
      .lean();

    const ordersWithMaterials = await Promise.all(
      orders.map(async (order) => {
        const materials = await OrderMaterial.find({ orderId: order._id })
          .populate("materialId", "name description category")
          .lean();
        return { ...order, materials };
      })
    );

    return ordersWithMaterials;
  } catch (error) {
    console.error("Siparişleri getirme hatası:", error);
    throw new OrderActionError("Sunucu hatası", 500);
  }
}

export async function getOrder(orderId) {
  const { user } = await auth();
  if (!user) throw new OrderActionError("Yetkisiz erişim", 401);

  await dbConnect();

  try {
    const order = await Order.findById(orderId)
      .populate("clinicId", "fullName email")
      .populate("materialId", "name description");

    if (!order) {
      throw new OrderActionError("Sipariş bulunamadı", 404);
    }

    if (
      user.role === "admin" ||
      (user.role === "diş_kliniği" && order.clinicId.id === user.id) ||
      (user.role === "laboratuvar" && order.status === "pending")
    ) {
      return order;
    }

    throw new OrderActionError("Bu siparişi görüntüleme yetkiniz yok", 403);
  } catch (error) {
    console.error("Sipariş getirme hatası:", error);
    throw new OrderActionError("Sunucu hatası", 500);
  }
}

const validStatuses = [
  "teklif_bekleniyor",
  "teklif_kabul_edildi",
  "uretimde",
  "gonderime_hazir",
  "kargoda",
  "teslim_edildi",
  "iptal_edildi",
];

export async function updateOrderStatus(orderId, status) {
  const { user } = await auth()
  if (!user) throw new OrderActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    // Find the order
    const order = await Order.findById(orderId)
    if (!order) {
      throw new OrderActionError("Sipariş bulunamadı", 404)
    }

    // Find the accepted offer for this order
    const acceptedOffer = await Offer.findOne({
      orderId: order._id,
      status: "kabul_edildi"
    })

    if (!acceptedOffer) {
      throw new OrderActionError("Bu sipariş için kabul edilmiş teklif bulunamadı", 404)
    }

    // Check if the user is the laboratory that made the offer
    if (user.role !== "laboratuvar" || acceptedOffer.offeredBy.toString() !== user.id) {
      throw new OrderActionError("Bu siparişin durumunu güncelleme yetkiniz yok", 403)
    }

    // Validate the status transition
    const validTransitions = {
      "teklif_kabul_edildi": ["uretimde", "iptal_edildi"],
      "uretimde": ["gonderime_hazir", "iptal_edildi"],
      "gonderime_hazir": ["kargoda", "iptal_edildi"],
      "kargoda": ["teslim_edildi", "iptal_edildi"]
    }

    if (!validTransitions[order.status]?.includes(status)) {
      throw new OrderActionError(`Geçersiz durum geçişi: ${order.status} -> ${status}`, 400)
    }

    // Update the order status
    order.status = status
    
    // Add timestamp if the order is being completed
    if (status === "teslim_edildi") {
      order.completedAt = new Date()
    }
    
    await order.save()

    revalidatePath(`/orders/${orderId}`)
    revalidatePath("/laboratory/orders")
    revalidatePath("/clinic/orders")
    
    return { success: true }
  } catch (error) {
    console.error("Sipariş durumu güncelleme hatası:", error)
    if (error.name === "OrderActionError") {
      throw error
    }
    throw new OrderActionError(error.message || "Sunucu hatası", error.status || 500)
  }
}

export async function getOrderDetails(orderId) {
  const { user } = await auth()
  if (!user) throw new OrderActionError("Yetkisiz erişim", 401)

  await dbConnect()

  try {
    // Find the order
    const order = await Order.findById(orderId)
      .populate('clinicId', 'fullName email role')
      .lean()

    if (!order) {
      throw new OrderActionError("Sipariş bulunamadı", 404)
    }

    // Find the accepted offer for this order
    const acceptedOffer = await Offer.findOne({
      orderId: order._id,
      status: "kabul_edildi"
    })
    .populate('offeredBy', 'fullName email role')
    .lean()

    if (!acceptedOffer) {
      throw new OrderActionError("Bu sipariş için kabul edilmiş teklif bulunamadı", 404)
    }

    // Check authorization - only the clinic that placed the order and the lab that made the offer can view
    const isClinic = user.id === order.clinicId._id.toString() && user.role === "diş_kliniği"
    const isLaboratory = user.id === acceptedOffer.offeredBy._id.toString() && user.role === "laboratuvar"

    if (!isClinic && !isLaboratory) {
      throw new OrderActionError("Bu siparişi görüntüleme yetkiniz yok", 403)
    }

    // Get order materials
    const orderMaterials = await OrderMaterial.find({ orderId: order._id })
      .populate('materialId', 'name category description')
      .lean()

    // Format the response
    return {
      id: order._id.toString(),
      title: order.title,
      description: order.description,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt?.toISOString() || order.createdAt.toISOString(),
      modelUrl: order.modelUrl,
      clinic: {
        id: order.clinicId._id.toString(),
        name: order.clinicId.fullName,
        email: order.clinicId.email,
        role: order.clinicId.role
      },
      laboratory: {
        id: acceptedOffer.offeredBy._id.toString(),
        name: acceptedOffer.offeredBy.fullName,
        email: acceptedOffer.offeredBy.email,
        role: acceptedOffer.offeredBy.role
      },
      offer: {
        id: acceptedOffer._id.toString(),
        price: acceptedOffer.price,
        deliveryTime: acceptedOffer.deliveryTime,
        createdAt: acceptedOffer.createdAt.toISOString(),
        status: acceptedOffer.status
      },
      materials: orderMaterials.map(material => ({
        id: material._id.toString(),
        name: material.materialId?.name || "Bilinmeyen Malzeme",
        category: material.materialId?.category || "Diğer",
        description: material.materialId?.description || "",
        quantity: material.quantity || 0,
        notes: material.notes || ""
      })),
      userRole: user.role // Adding the user role to adjust UI based on who's viewing
    }
  } catch (error) {
    console.error("Sipariş detayları getirme hatası:", error)
    if (error.name === "OrderActionError") {
      throw error
    }
    throw new OrderActionError(error.message || "Sunucu hatası", error.status || 500)
  }
}

export async function getLabProductionOrders() {
  const { user } = await auth()
  if (!user || user.role !== "laboratuvar") {
    throw new OrderActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    // Find all orders where this laboratory's offer was accepted
    const acceptedOffers = await Offer.find({
      offeredBy: user.id,
      status: "kabul_edildi"
    }).lean()

    // Get order IDs from accepted offers
    const orderIds = acceptedOffers.map(offer => offer.orderId)

    // Find orders that are in production, ready for shipping, or in shipping
    const orders = await Order.find({
      _id: { $in: orderIds },
      status: { $in: ["uretimde", "gonderime_hazir", "kargoda"] }
    })
    .populate('clinicId', 'fullName email')
    .sort({ updatedAt: -1 })
    .lean()

    // Map orders to include necessary information
    return orders.map(order => {
      const relatedOffer = acceptedOffers.find(
        offer => offer.orderId.toString() === order._id.toString()
      )
      
      return {
        id: order._id.toString(),
        title: order.title,
        description: order.description,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt?.toISOString() || order.createdAt.toISOString(),
        clinic: {
          name: order.clinicId.fullName,
          email: order.clinicId.email
        },
        deliveryTime: relatedOffer.deliveryTime
      }
    })
  } catch (error) {
    console.error("Üretimdeki siparişleri getirme hatası:", error)
    throw new OrderActionError("Üretimdeki siparişleri getirme hatası", 500)
  }
}

export async function getLabCompletedOrders() {
  const { user } = await auth()
  if (!user || user.role !== "laboratuvar") {
    throw new OrderActionError("Yetkisiz erişim", 401)
  }

  await dbConnect()

  try {
    // Find all orders where this laboratory's offer was accepted
    const acceptedOffers = await Offer.find({
      offeredBy: user.id,
      status: "kabul_edildi"
    }).lean()

    // Get order IDs from accepted offers
    const orderIds = acceptedOffers.map(offer => offer.orderId)

    // Find completed orders
    const orders = await Order.find({
      _id: { $in: orderIds },
      status: "teslim_edildi"
    })
    .populate('clinicId', 'fullName email')
    .sort({ updatedAt: -1 })
    .lean()

    // Map orders to include necessary information
    return orders.map(order => {
      const relatedOffer = acceptedOffers.find(
        offer => offer.orderId.toString() === order._id.toString()
      )
      
      return {
        id: order._id.toString(),
        title: order.title,
        description: order.description,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt?.toISOString() || order.createdAt.toISOString(),
        clinic: {
          name: order.clinicId.fullName,
          email: order.clinicId.email
        },
        deliveryTime: relatedOffer.deliveryTime
      }
    })
  } catch (error) {
    console.error("Tamamlanan siparişleri getirme hatası:", error)
    throw new OrderActionError("Tamamlanan siparişleri getirme hatası", 500)
  }
}
