const Admin = require('../models/Admin')
const Product = require('../models/Product')
const User = require('../models/User')
const Category = require('../models/Category')
const Image = require('../models/image')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!email || !password || !name) {
      throw new Error('Please add mandatory field')
    }
    const eid = await Admin.findOne({ email: email })
    if (eid) {
      res.json({ message: 'Email already exist' })
    } else {
      let admin = new Admin({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      })
      const res_ = await admin.save()
      console.log(res_)
      res.json({ message: 'admin succesfully registered' })
    }
  } catch (error) {
    res.json({ message: 'error occured in register admin-' + error.message })
  }
}

//check admin
// const isAdmin = async (req, res, next) => {
//   if (req.user.role === 0) {
//     return next(new ErrorResponse('Access denied, you must be an admin', 401))
//   }
//   next()
// }

const login = async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new Error('email or password is required')
  }
  const checkEmail = await Admin.findOne({ email: email })
  if (!checkEmail) throw new Error('email is not register with db')

  if (!(email && (await bcrypt.compare(password, checkEmail.password)))) {
    res.json({ message: 'please enter valid email and password' })
  }

  jwt.sign(
    { userId: checkEmail._id.toString() },
    'secreet',
    { expiresIn: '1h' },
    (err, token) => {
      if (err) throw new Error('something went wrong')
      if (token) {
        res.json({ token })
      }
    },
  )
}

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    const token = bearer[1]

    jwt.verify(token, 'secreet', (err, authData) => {
      if (err) {
        res.json({ message: 'Invalidate token-' + err.message })
      } else {
        req.headers.userid = authData.userId
        next()
      }
    })
  }
}

const show = async (req, res, next) => {
  let adminId = req.headers.userid
  if (!adminId) {
    throw new Error('Id is missing')
  }

  try {
    const show = await Admin.findById(adminId)
    res.send({
      name: show.name,
      email: show.email,
    })
  } catch (error) {
    res.json({ message: 'error ocurred in access admin data-' + error.message })
  }
}

const destroy = async (req, res, next) => {
  const aid = req.params.id
  console.log(aid)
  const data = await User.findByIdAndDelete(aid)
  res.json({ message: 'deleted' })
}

// product category
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
//============

// create product
const product = async (req, res, next) => {
  try {
    const category = req.params.id
    const { name, sku, price, modelId, description, image } = req.body

    if (!name || !sku || !price || !modelId || !description)
      throw new Error('please add mandatory feild')

    let prod = await Product.findOne({ name: name })
    if (prod) {
      res.json({ message: 'product already added' })
    } else {
      let product = new Product({
        name: name,
        sku: sku,
        price: price,
        categoryId: category,
        modelId: modelId,
        description: description,
        image: image,
      })
      await product.save()
      res.json({ message: 'product added successfully' })
    }
  } catch (error) {
    return res.json({ message: error.message }).status(403)
  }
}

//get product

const getProduct = async (req, res, next) => {
  const product = await Product.find()
  res.send(product)
}

// update product
const productUpdate = async (req, res, next) => {
  const id = req.params.id
  console.log(id)

  const { name, description, sku } = req.body

  if (!name || !description || !sku)
    throw new Error('please add required field')

  let updateData = {
    name: name,
    description: description,
    sku: sku,
  }

  try {
    const update = await Product.findByIdAndUpdate(id, {
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

module.exports = {
  register,
  login,
  verifyToken,
  // isAdmin,
  show,
  destroy,
  category,
  upload,
  product,
  getProduct,
  productUpdate,
  productDelete,
}
