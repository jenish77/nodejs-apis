const { default: mongoose } = require('mongoose')
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

//transfer product from one warehouse to another
const transfer = async (req, res, next) => {
  const { quantity, fromWaarehouseId, toWarehouseId, productId } = req.body

  if (!quantity || quantity < 0) throw new Error('please add valid quantity')

  const Data = await WarehouseProduct.findOne({
    warehouseId: toWarehouseId,
    ProductId: productId,
  })

  const senderData = await WarehouseProduct.findOne({
    warehouseId: fromWaarehouseId,
  })

  if (senderData.quantity < quantity) throw new Error('Enter sufficient amount')

  const update = await WarehouseProduct.findByIdAndUpdate(
    { _id: senderData._id },
    { $set: { quantity: senderData.quantity - quantity } },
  )

  if (!Data) {
    let data = new WarehouseProduct({
      warehouseId: toWarehouseId,
      ProductId: productId,
      quantity: quantity,
    })
    await data.save()
    res.json({ message: 'product transfered in warehouse.' })
  } else {
    const newUpdate = await WarehouseProduct.findByIdAndUpdate(
      { _id: Data._id },
      { $set: { quantity: quantity + Data.quantity } },
    )
    res.json({ message: 'product transfered in warehouse.' })
  }
}

const getProduct = async (req, res, next) => {
  const pId = req.body.productId

  const product = await WarehouseProduct.aggregate([
    {
      $match: { ProductId: mongoose.Types.ObjectId(pId) },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'ProductId',
        foreignField: '_id',
        as: 'productData',
      },
    },
    { $unwind: '$productData' },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'warehouseId',
        foreignField: '_id',
        as: 'warehouseData',
      },
    },
    { $unwind: '$warehouseData' },
    {
      $project: {
        productName: '$productData.name',
        quantity: 1,
        warehouseName: '$warehouseData.name',
        warehouseAddress: '$warehouseData.address',
      },
    },
  ])
  res.send(product)
}

module.exports = {
  warehouseRegister,
  warehouseProductadd,
  transfer,
  getProduct,
}
