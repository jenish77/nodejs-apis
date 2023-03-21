const Order = require('../models/Order')
const mongoose = require('mongoose')
const WarehouseProduct = require('../models/WarehouseProduct')
const Validator = require('validatorjs')

const order = async (req, res, next) => {
  const userId = req.headers.userid
  const productId = req.params.id
  const quantity = req.body.quantity

  const data = {
    quantity: quantity,
  }
  const rules = {
    quantity: 'required|integer',
  }
  const validator = new Validator(data, rules)

  if (validator.fails()) {
    let transformed = {}
    Object.keys(validator.errors.errors).forEach(function (key, val) {
      transformed[key] = validator.errors.errors[key][0]
    })

    const responseObject = {
      status: 'false',
      message: transformed,
    }
    return res.json(apiResponse(responseObject))
  }

  let addOrder = new Order({
    productId: productId,
    quantity: quantity,
    userId: userId,
  })

  await addOrder.save()
  if (addOrder) {
    const Data = await WarehouseProduct.findOne({ ProductId: productId })

    const updateData = await WarehouseProduct.findByIdAndUpdate(
      { _id: Data._id },
      { $set: { quantity: Data.quantity - quantity } },
    )
  }
  let obj = {
    status: 'true',
    message: 'order place successfully.',
  }

  return res.json(apiResponse(obj))
  //   res.json({ message: 'orderr place' })
}

const getOrder = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query
  const orderId = req.params.id

  const order = await Order.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(orderId) },
    },

    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'orders',
      },
    },
    { $unwind: '$orders' },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userData',
      },
    },
    { $unwind: '$userData' },
    {
      $project: {
        userName: '$userData.name',
        productName: '$orders.name',
        quantity: 1,
        price: '$orders.price',
      },
    },
  ])
    .limit(page * limit)
    .skip((page - 1) * limit)
  res.send(order)
}

module.exports = { order, getOrder }
