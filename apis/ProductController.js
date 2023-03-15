const Admin = require('../models/Admin')
const Product = require('../models/Product')
// const User = require('../models/User')
const Category = require('../models/Category')
const Image = require('../models/image')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const bcrypt = require('bcrypt')

// create category for products
const category = async (req, res, next) => {
  try {
    const { name } = req.body
    const categorydata = await Category.findOne({ name: name })
    if (!categorydata) {
      let category = new Category({
        name: req.body.name,
        status: req.body.status,
      })
      await category.save()
      res.json({ message: 'category added successfully' })
    } else {
      res.json({ message: 'already added this category' })
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
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'jenishmaru2020@gmail.com',
      pass: 'bpfbeycocmjfuwlm',
    },
  })

  try {
    const category = req.params.id
    const { name, sku, price, modelId, description, image, quantity } = req.body

    let userId = req.headers.userid

    const mail = await Admin.findById(userId).select('email')

    if (!name || !sku || !price || !modelId || !description)
      throw new Error('please add mandatory feild')

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
      let mailOptions = {
        from: 'jenishmaru2020@gmail.com',
        to: mail,
        subject: 'Product Created',
        text: `you have upload product ${name} with ${quantity} Quantity. `,
      }

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log('Email sent: ' + info.response)
        }
      })
      //--------------------
      res.json({ message: 'product added successfully' })
    }
  } catch (error) {
    return res.json({ message: error.message }).status(403)
  }
}

//get product

const getProduct = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query
  const product = await Product.find()
    .limit(limit * page)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })
  res.send(product)
}

// update product
const productUpdate = async (req, res, next) => {
  const pId = req.params.id

  const { name, description, sku, quantity } = req.body

  if (!name || !description || !sku || !quantity)
    throw new Error('please add required field')

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
    res.json({ message: 'product updated successfully' })
  } catch (error) {
    return res.json({ message: error.message }).status(403)
  }
}

//delete product
const productDelete = async (req, res, next) => {
  try {
    const pId = req.params.id
    const remove = await Product.findByIdAndRemove(pId)
    res.json({ message: 'delete successfully' })
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

module.exports = {
  category,
  upload,
  product,
  getProduct,
  productUpdate,
  productDelete,
}
