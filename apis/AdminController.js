const Admin = require('../models/Admin')
const Product = require('../models/Product')
const Role = require('../models/Role')
const Userroles = require('../models/Userrole')
const User = require('../models/User')
const Category = require('../models/Category')
const Image = require('../models/image')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Validator = require('validatorjs')
const apiResponse = require('../response')
const { default: mongoose } = require('mongoose')

// function isAdmin(role) {
//   return (req, res, next) => {
//     const admin = req.params.role
//     console.log('123456', admin)
//     // function isAdmin(options) {
//     console.log('bahar admin')
//     if ('admin') {
//       console.log('inside admin')
//       next()
//     } else {
//       res.json({ message: 'tane permission nathi' })
//     }
//   }
// }

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const roleId = req.params.id

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
      // role: 'required|string',
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
        roleId: roleId,
      })
      const res_ = await admin.save()
      // console.log(res_)
      let obj = {
        status: 'true',
        message: 'admin succesfully registered',
      }

      return res.json(apiResponse(obj))
    }
  } catch (error) {
    res.json({ message: 'error occured in register admin-' + error.message })
  }
}

//check admin

// module.exports = function isAdmin(options) {}

// const isAdmin = async (req, res, next) => {
//   if (req.headers.role === 'user') {
//     console.log('req.headers.role', req.headers.role)
//     next()
//   } else {
//     console.log()
//     res.status(403).send({ message: 'Access denied, user must be an admin' })
//   }
// }

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

  const checkEmail = await Admin.findOne({ email: email })

  // console.log(checkEmail)

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
      } else {
        req.headers.userid = authData.userId
        req.headers.role = authData.role
        next()

        // if (req.headers.role !== 'admin') {
        //   return res.json({ message: 'Access denied, user must be an admin' })
        // } else {
        // }
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

  const data = await User.findByIdAndDelete(aid)
  res.json({ message: 'deleted' })
}

const getProfile = async (req, res, next) => {
  let userId = req.headers.userid
  const data = await Admin.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'roleId',
        foreignField: '_id',
        as: 'roleData',
      },
    },
    {
      $lookup: {
        from: 'userroles',
        localField: 'roleData._id',
        foreignField: 'roleId',
        as: 'userroleData',
      },
    },
    {
      $lookup: {
        from: 'permissions',
        localField: 'userroleData.permissionId',
        foreignField: '_id',
        as: 'permisssionData',
      },
    },
    {
      $project: {
        name: '$name',
        role: '$roleData.role',
        permission: '$permisssionData.PermissionName',
      },
    },
  ])
  res.send(data)
}

module.exports = {
  register,
  login,
  verifyToken,
  // isAdmin,
  show,
  destroy,
  getProfile,
}
