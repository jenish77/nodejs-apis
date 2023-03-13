const mongoose = require('mongoose')
const Schema = mongoose.Schema

const warehouseSchema = new Schema(
  {
    name: { type: String },
    capacity: { type: Number },
    address: { type: String },
    productId: { type: mongoose.Types.ObjectId, ref: 'Product' },
  },
  { timestamps: true },
)

const Warehouse = mongoose.model('warehouse', warehouseSchema)
module.exports = Warehouse
