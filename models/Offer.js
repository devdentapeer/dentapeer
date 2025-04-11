import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const offerSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    offeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    deliveryTime: { type: String, required: true },
    status: { type: String, enum: ['bekleniyor', 'kabul_edildi', 'reddedildi', 'iptal_edildi'], default: 'bekleniyor' },
    createdAt: { type: Date, default: Date.now }
  });

offerSchema.plugin(toJSON);
  
export default mongoose.models.Offer || mongoose.model("Offer", offerSchema);
