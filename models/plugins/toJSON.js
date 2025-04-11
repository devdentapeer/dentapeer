const toJSONPlugin = (schema) => {
  schema.set("toJSON", {
    virtuals: true, // Sanal alanları JSON çıktısına dahil et
    versionKey: false, // __v alanını JSON'da göstermemek için
    transform: (doc, ret) => {
      ret.id = ret._id; // _id yerine id olarak dönüştür
      delete ret._id;
      return ret;
    },
  });
};

export default toJSONPlugin;
