const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: {
      type: String,
    },
    resetLink: {
      data: String,
      default: '',
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(this.password, salt)
    this.password = hashPassword
    next()
  } catch (error) {
    next(error)
  }
})

const User = mongoose.model('user', userSchema)
module.exports = User
