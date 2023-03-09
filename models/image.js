const mongoose = require('mongoose')
const Schema = mongoose.Schema

const imageSchema = new Schema({
  name: { type: String, required: true },
  image: {
    data: String,
    contentType: String,
  },
})

const Image = mongoose.model('image', imageSchema)
module.exports = Image
