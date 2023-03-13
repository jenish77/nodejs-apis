const mongoose = require('mongoose')
const Schema = mongoose.Schema

const warehouseProductSchema = new Schema(
  {
    warehouseId: { type: mongoose.Types.ObjectId, ref: 'Warehouse' },
    ProductId: { type: mongoose.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number },
  },
  { timestamps: true },
)

const WarehouseProduct = mongoose.model(
  'WarehouseProduct',
  warehouseProductSchema,
)
module.exports = WarehouseProduct
