const orderSchema = new Schema({
  // ... existing fields ...
  isCompletedByClinic: {
    type: Boolean,
    default: false
  },
  isCompletedByLab: {
    type: Boolean,
    default: false
  }
  // ... existing fields ...
}) 