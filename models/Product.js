const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema(
  {
    name: { type: String },
    sku: { type: Number },
    price: { type: Number },
    description: { type: String },
    modelId: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    quantity: { type: Number },
    image: {
      type: String,
      get(image) {
        if (image) {
          return `http://localhost:3000/image/` + image
        } else {
          return null
        }
      },
    },
  },
  { timestamps: true },
  { toObject: { getters: true }, toJSON: { getters: true } },
)

const Product = mongoose.model('product', productSchema)
module.exports = Product
