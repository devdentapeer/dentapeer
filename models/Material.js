import mongoose from "mongoose";
import toJSONPlugin from "./plugins/toJSON";

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

materialSchema.plugin(toJSONPlugin);

export default mongoose.models.Material ||
  mongoose.model("Material", materialSchema);
