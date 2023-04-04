const Admin = require('../models/Admin')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Image = require('../models/image')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const Validator = require('validatorjs')

const apiResponse = require('../response')

const bcrypt = require('bcrypt')

// create category for products
const category = async (req, res, next) => {
  try {
    const { name } = req.body
    const userId = req.headers.userid
    // console.log(userId)

    const data = {
      name: name,
    }
    const rules = {
      name: 'required|string',
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

    const categorydata = await Category.findOne({ name: name })

    // const user = await Admin.findOne({ _id: userId })

    // console.log('categorydata', categorydata)

    // if (user.role !== 'superAdmin') {
    //   return res.json({ message: 'you dont have access to add category' })
    // }

    if (!categorydata) {
      let category = new Category({
        name: req.body.name,
        status: req.body.status,
      })
      await category.save()
      let obj = {
        status: 'true',
        message: 'category added successfully',
      }

      return res.json(apiResponse(obj))
      // res.json({ message: 'category added successfully' })
    } else {
      let obj = {
        status: 'true',
        message: 'already added this category',
      }

      return res.json(apiResponse(obj))
      // res.json({ message: 'already added this category' })
    }
  } catch (error) {
    return res.json({ message: error.message }).status(403)
  }
}

//upload image,
const upload = async (req, res, next) => {
  uploads(req, res, (err) => {
    if (err) {
      console.log(err)
    } else {
      const newImage = new Image({
        name: req.body.name,
        image: {
          data: req.file.filename,
          contentType: 'image/png',
        },
      })

      let obj = {
        imageurl: `http://localhost:3000/image/${req.file.filename}`,
        image: req.file.filename,
      }

      newImage
        .save()
        .then(() => res.json(obj))
        .catch((err) => res.send({ err }))
    }
  })
}

const Storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname)
  },
})

const uploads = multer({
  storage: Storage,
}).single('testImage')
//-----
const express = require('express')
const appp = express()
appp.use('/image', express.static('public/uploads/'))
//===============================================================

// create product
const product = async (req, res, next) => {
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

  try {
    const category = req.params.id
    const { name, sku, price, modelId, description, image, quantity } = req.body

    let userId = req.headers.userid

    const data = {
      name: name,
      sku: sku,
      price: price,
      modelId: modelId,
      description: description,
      image: image,
      quantity: quantity,
    }
    const rules = {
      name: 'required|string',
      sku: 'required',
      price: 'required|integer',
      modelId: 'required',
      description: 'required|string',
      image: 'required',
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

    // const mail = await Admin.findById(userId).select('email')

    // if (!name || !sku || !price || !modelId || !description)
    //   throw new Error('please add mandatory feild')

    let prod = await Product.findOne({ sku: sku })
    if (prod) {
      res.json({ message: 'product already added' })
    } else {
      let product = new Product({
        name: name,
        sku: sku,
        price: price,
        quantity: quantity,
        categoryId: category,
        modelId: modelId,
        description: description,
        image: image,
      })
      await product.save()
      //---------------------
      // let mailOptions = {
      //   from: 'jenishmaru2020@gmail.com',
      //   to: mail,
      //   subject: 'Product Created',
      //   text: `you have upload product ${name} with ${quantity} Quantity. `,
      // }

      // transporter.sendMail(mailOptions, function (error, info) {
      //   if (error) {
      //     console.log(error)
      //   } else {
      //     console.log('Email sent: ' + info.response)
      //   }
      // })
      // //--------------------
      let obj = {
        status: 'true',
        message: 'product added successfully',
      }

      return res.json(apiResponse(obj))
      // res.json({ message: 'product added successfully' })
    }
  } catch (error) {
    return res.json({ message: error.message }).status(403)
  }
}

//get product with searching and sorting by passing params

const getProducts = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query

  const keyword = req.query.keyword

  const sortOrder = req.query.SortBy === 'desc' ? -1 : 1

  const product = await Product.find()

    .limit(limit * page)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })

  const matchProduct = await Product.find({ name: { $regex: keyword } }).sort({
    name: sortOrder,
  })

  res.send(matchProduct)
}

// update product
const productUpdate = async (req, res, next) => {
  const pId = req.params.id

  const { name, description, sku, quantity } = req.body

  const data = {
    name: name,
    sku: sku,
    description: description,
    quantity: quantity,
  }
  const rules = {
    name: 'required|string',
    sku: 'required',
    description: 'required|string',
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

  let updateData = {
    name: name,
    description: description,
    sku: sku,
    quantity: quantity,
  }

  try {
    const update = await Product.findByIdAndUpdate(pId, {
      $set: updateData,
    })
    let obj = {
      status: 'true',
      message: 'product updated successfully',
    }

    return res.json(apiResponse(obj))
    // res.json({ message: 'product updated successfully' })
  } catch (error) {
    return res.json({ message: error.message }).status(403)
  }
}

//delete product
const productDelete = async (req, res, next) => {
  try {
    const pId = req.params.id
    const remove = await Product.findByIdAndRemove(pId)
    let obj = {
      status: 'true',
      message: 'delete successfully',
    }

    return res.json(apiResponse(obj))
    // res.json({ message: 'delete successfully' })
  } catch (error) {
    return res.json({ message: error.message })
  }
}

//TO Create Warehouse
//warehouse name
//warehouse capacity
//warehouse address
//warehouse productId
//

// const search = async (req, res, next) => {
//   res.json({ message: 'serching...' })
// }

module.exports = {
  category,
  upload,
  product,
  getProducts,
  productUpdate,
  productDelete,
}
