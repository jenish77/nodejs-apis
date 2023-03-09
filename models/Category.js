const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
  name: { type: String },
  status: { type: Boolean },
})

const Category = mongoose.model('category', categorySchema)
module.exports = Category
