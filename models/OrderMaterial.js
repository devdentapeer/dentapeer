import mongoose from "mongoose";
import   toJSON  from "./plugins/toJSON.js";

const orderMaterialSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    quantity: { type: Number, required: true },
    notes: String
}); 

orderMaterialSchema.plugin(toJSON);

export default mongoose.models.OrderMaterial || mongoose.model("OrderMaterial", orderMaterialSchema);
