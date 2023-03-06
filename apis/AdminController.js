const Admin = require('../models/Admin')
const Employee = require('../models/Employee')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { response } = require('express')
const { error } = require('console')

const register = async (req, res, next) => {
  //   res.json({ message: 'register as admin' })
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
    { expiresIn: '20m' },
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
    console.log(token)

    jwt.verify(token, 'secreet', (err, authData) => {
      if (err) {
        res.json({ message: 'Invalidate token-' + err.message })
      } else {
        console.log('userId', authData.userId)
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
  console.log(adminId)
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
  const data = await Employee.findByIdAndDelete(aid)
  res.json({ message: 'deleted' })
}

module.exports = {
  register,
  login,
  verifyToken,
  show,
  destroy,
}
