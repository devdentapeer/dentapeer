import mongoose from "mongoose";
import   toJSON  from "./plugins/toJSON.js";

const orderSchema = new mongoose.Schema({
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['teklif_bekleniyor', 'teklif_kabul_edildi', 'uretimde',
         'gonderime_hazir', 'kargoda', 'teslim_edildi', 'iptal_edildi'], 
      default: 'teklif_bekleniyor'
    },
    modelUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    acceptedOffer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Offer'
    },
});

orderSchema.plugin(toJSON);
orderSchema.index({ status: 1, createdAt: -1 });
export default mongoose.models.Order || mongoose.model("Order", orderSchema);
