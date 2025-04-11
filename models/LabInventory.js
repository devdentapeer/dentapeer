import mongoose from "mongoose";
import toJSONPlugin from "./plugins/toJSON";

const labInventorySchema = new mongoose.Schema({
  labId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material",
    required: true,
  },
  price: { type: Number, required: true },
});

labInventorySchema.plugin(toJSONPlugin);

export default mongoose.models.LabInventory ||
  mongoose.model("LabInventory", labInventorySchema);
