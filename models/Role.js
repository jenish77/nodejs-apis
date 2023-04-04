const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const bcrypt = require('bcrypt')

const roleSchema = new Schema(
  {
    role: { type: String },
  },
  { timestamps: true },
)

const Role = mongoose.model('role', roleSchema)
module.exports = Role
