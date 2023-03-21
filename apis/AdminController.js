const Admin = require('../models/Admin')
const Product = require('../models/Product')
const User = require('../models/User')
const Category = require('../models/Category')
const Image = require('../models/image')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Validator = require('validatorjs')

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const data = {
      name: name,
      email: email,
      password: password,
    }
    const rules = {
      name: 'required|string',
      email: 'required|string|email',
      password: [
        'required',
        'regex:/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/',
      ],
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

    // if (!email || !password || !name) {
    //   throw new Error('Please add mandatory field')
    // }
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
      // console.log(res_)
      let obj = {
        status: 'true',
        message: 'admin succesfully registered',
      }

      return res.json(apiResponse(obj))
      // res.json({ message: 'admin succesfully registered' })
    }
  } catch (error) {
    res.json({ message: 'error occured in register admin-' + error.message })
  }
}

//check admin
const isAdmin = async (req, res, next) => {
  if (req.headers.role === 'admin') {
    // console.log(req.headers.role)
    next()
  } else {
    console.log()
    res.status(403).send({ message: 'Access denied, user must be an admin' })
  }
}

const login = async (req, res, next) => {
  const { email, password } = req.body

  const data = {
    email: email,
    password: password,
  }
  // console.log(password)
  const rules = {
    email: 'required|string|email',
    password: 'required',
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

  // if (!email || !password) {
  //   throw new Error('email or password is required')
  // }
  const checkEmail = await Admin.findOne({ email: email })
  // if (!checkEmail) throw new Error('email is not register with db')
  if (!checkEmail) {
    return res.json({ message: 'email is not register with db ' })
  }

  if (!(email && (await bcrypt.compare(password, checkEmail.password)))) {
    return res.json({ message: 'please enter valid email and password' })
  }

  jwt.sign(
    { userId: checkEmail._id.toString(), role: 'admin' },
    'secreet',
    { expiresIn: '2h' },
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
        res.json({
          message: 'Unauthorize Access! ' + err.message,
        })
        // next()
      } else {
        req.headers.userid = authData.userId
        req.headers.role = authData.role
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

module.exports = {
  register,
  login,
  verifyToken,
  isAdmin,
  show,
  destroy,
}
