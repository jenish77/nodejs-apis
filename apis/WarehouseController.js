const { default: mongoose } = require('mongoose')
const Admin = require('../models/Admin')
const Order = require('../models/Order')
const Product = require('../models/Product')
const Warehouse = require('../models/Warehouse')
const WarehouseProduct = require('../models/WarehouseProduct')
const nodemailer = require('nodemailer')
const Validator = require('validatorjs')
const apiResponse = require('../response')

// warehouse register
const warehouseRegister = async (req, res, next) => {
  const { name, capacity, address } = req.body

  const datas = {
    name: name,
    capacity: capacity,
    address: address,
  }
  const rules = {
    name: 'required|string',
    capacity: 'required|integer',
    address: 'required',
  }

  const validator = new Validator(datas, rules)

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

  let data = await Warehouse.findOne({ name: name })

  if (!data) {
    let warehouse = new Warehouse({
      name: name,
      capacity: capacity,
      address: address,
    })
    await warehouse.save()
    let obj = {
      status: 'true',
      message: 'warehouse added successfully',
    }

    return res.json(apiResponse(obj))
    // res.json({ message: 'warehouse added successfully' })
  } else {
    res.json({ message: 'warehouse already exists' })
  }
}

// add product in warehouse========***************

const warehouseProductadd = async (req, res, next) => {
  //******************** */
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   host: 'smtp.gmail.com',
  //   port: 456,
  //   secure: true,
  //   auth: {
  //     user: 'jenishmaru2020@gmail.com',
  //     pass: 'bpfbeycocmjfuwlm',
  //   },
  // })
  //*************************** */

  const { quantity, productId } = req.body
  const wId = req.params.id
  const userId = req.headers.userid

  const data = {
    quantity: quantity,
    quantity: productId,
  }
  const rules = {
    quantity: 'required|integer',
    quantity: 'required',
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

  // const mail = await Admin.findById(userId).select('email')
  // console.log('+++mail', mail)

  const warehouse = await Warehouse.findOne({ _id: wId })

  if (warehouse.capacity < quantity) {
    res.json({ message: 'product quantity is exits the warehouse capacity' })
    // throw new Error('product quantity is exits the warehouse capacity')
  }

  if (quantity < 0) {
    return res.json({
      message:
        'product quantity is exits the warehouse capacityplease add valid quantity',
    })
  }
  // throw new Error('please add valid quantity')

  const Data = await Product.findOne({ _id: productId })

  if (Data.quantity < quantity) throw new Error('Enter sufficient amount')

  const updateData = await Product.findByIdAndUpdate(
    { _id: productId },
    { $set: { quantity: Data.quantity - quantity } },
  )

  const warepro = await WarehouseProduct.findOne({
    warehouseId: wId,
    ProductId: productId,
  })

  // const warehouse = await Warehouse.findOne({ _id: wId })

  if (!warepro) {
    let addPW = new WarehouseProduct({
      warehouseId: wId,
      ProductId: productId,
      quantity: quantity,
    })
    await addPW.save()

    // let mailOptions = {
    //   from: 'jenishmaru2020@gmail.com',

    //   to: mail,
    //   subject: 'product added to Warehouse',
    //   Text: `you have addead product ${Data.name} with ${quantity} Quantity in ${warehouse.address} this warehouse.`,
    // }

    // transporter.sendMail(mailOptions, function (error, info) {
    //   if (error) {
    //     console.log(error)
    //   } else {
    //     console.log('Email sent: ' + info.response)
    //   }
    // })

    res.json({ message: 'product addead in warehouse.' })
  } else {
    const update = await WarehouseProduct.findByIdAndUpdate(
      { _id: warepro._id },
      { $set: { quantity: quantity + warepro.quantity } },
    )
    // let mailOptions = {
    //   from: 'jenishmaru2020@gmail.com',
    //   to: mail,
    //   subject: 'product added to Warehouse',
    //   Text: `you have addead product ${Data.name} with ${quantity} Quantity in ${warehouse.address} this warehouse.`,
    // }

    // transporter.sendMail(mailOptions, function (error, info) {
    //   if (error) {
    //     console.log(error)
    //   } else {
    //     console.log('Email sent: ' + info.response)
    //   }
    // })

    res.json({ message: 'product addead in warehouse.' })
  }
}

//transfer product from one warehouse to another
const transfer = async (req, res, next) => {
  const { quantity, fromWaarehouseId, toWarehouseId, productId } = req.body

  const data = {
    quantity: quantity,
    fromWaarehouseId: fromWaarehouseId,
    toWarehouseId: toWarehouseId,
    productId: productId,
  }
  const rules = {
    quantity: 'required|integer',
    fromWaarehouseId: 'required',
    toWarehouseId: 'required',
    productId: 'required',
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

  // var transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   host: 'smtp.gmail.com',
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     user: 'jenishmaru2020@gmail.com',
  //     pass: 'bpfbeycocmjfuwlm',
  //   },
  // })

  let userId = req.headers.userid

  // const mail = await Admin.findById(userId).select('email')

  if (quantity < 0) {
    return res.json({
      message: 'please add valid quantity',
    })
  }
  // if (quantity < 0) throw new Error('please add valid quantity')

  const Data = await WarehouseProduct.findOne({
    warehouseId: toWarehouseId,
    ProductId: productId,
  })

  const senderData = await WarehouseProduct.findOne({
    warehouseId: fromWaarehouseId,
  })

  if (senderData.quantity < quantity) {
    return res.json({ message: 'Enter sufficient amount' })
  }
  //  throw new Error('Enter sufficient amount')

  const update = await WarehouseProduct.findByIdAndUpdate(
    { _id: senderData._id },
    { $set: { quantity: senderData.quantity - quantity } },
  )

  const fromWarehouse = await Warehouse.findOne({
    _id: fromWaarehouseId,
  }).select('address')

  const toWarehouse = await Warehouse.findOne({
    _id: toWarehouseId,
  }).select('address')

  const product = await Product.findOne({
    _id: productId,
  }).select('name')

  if (!Data) {
    let data = new WarehouseProduct({
      warehouseId: toWarehouseId,
      ProductId: productId,
      quantity: quantity,
    })
    await data.save()

    //------------------------
    // let mailOptions = {
    //   from: 'jenishmaru2020@gmail.com',
    //   to: mail,
    //   subject: 'Product Created',
    //   text: `you have transfer product ${product} with ${quantity} Quantity from ${fromWarehouse} to ${toWarehouse}. `,
    // }

    // transporter.sendMail(mailOptions, function (error, info) {
    //   if (error) {
    //     console.log(error)
    //   } else {
    //     console.log('Email sent: ' + info.response)
    //   }
    // })
    //-----------------------
    let obj = {
      status: 'true',
      message: 'product transfered in warehouse.',
    }

    return res.json(apiResponse(obj))
    // res.json({ message: 'product transfered in warehouse.' })
  } else {
    const newUpdate = await WarehouseProduct.findByIdAndUpdate(
      { _id: Data._id },
      { $set: { quantity: quantity + Data.quantity } },
    )
    let obj = {
      status: 'true',
      message: 'product transfered in warehouse.',
    }

    return res.json(apiResponse(obj))
    // res.json({ message: 'product transfered in warehouse.' })
  }
}

//get product from productid
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

//get product from warehouseId
const product = async (req, res, next) => {
  const wId = req.body.warehouseId

  const product = await WarehouseProduct.aggregate([
    {
      $match: { warehouseId: mongoose.Types.ObjectId(wId) },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'ProductId',
        foreignField: '_id',
        as: 'Data',
      },
    },
    { $unwind: '$Data' },
    {
      $project: {
        productName: '$Data.name',
        quantity: 1,
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
  product,
}
