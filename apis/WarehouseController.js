const Product = require('../models/Product')
const Warehouse = require('../models/Warehouse')
const WarehouseProduct = require('../models/WarehouseProduct')
// const { update, update } = require('./UserController')

const warehouseRegister = async (req, res, next) => {
  const { name, capacity, address } = req.body

  if (!name || !capacity || !address) throw new Error('add mandatory field')

  let data = await Warehouse.findOne({ name: name })

  if (!data) {
    let warehouse = new Warehouse({
      name: name,
      capacity: capacity,
      address: address,
    })
    await warehouse.save()
    res.json({ message: 'warehouse added successfully' })
  } else {
    res.json({ message: 'warehouse already exists' })
  }
}

const warehouseProductadd = async (req, res, next) => {
  const { quantity, productId } = req.body
  const wId = req.params.id

  const Data = await Product.findOne({ _id: productId })

  const updateData = await Product.findByIdAndUpdate(
    { _id: productId },
    { $set: { quantity: Data.quantity - quantity } },
  )

  const warepro = await WarehouseProduct.findOne({
    warehouseId: wId,
    ProductId: productId,
  })

  if (!warepro) {
    let addPW = new WarehouseProduct({
      warehouseId: wId,
      ProductId: productId,
      quantity: quantity,
    })
    await addPW.save()
    res.json({ message: 'product addead in warehouse.' })
  } else {
    const update = await WarehouseProduct.findByIdAndUpdate(
      { _id: warepro._id },
      { $set: { quantity: quantity + warepro.quantity } },
    )
    res.json({ message: 'product addead in warehouse.' })
  }
}

module.exports = { warehouseRegister, warehouseProductadd }
