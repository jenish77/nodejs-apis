const { ObjectId } = require('bson')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema(
  {
    name: { type: String, required: true },
    like: { type: Number },
    userid: { type: mongoose.Types.ObjectId, ref: 'User' },
    postimage: { type: String },

    // likes: [{ type: ObjectId, ref: 'User' }],
    // imageurl: String,
  },
  { timestamps: true },
)

const Post = mongoose.model('post', postSchema)
module.exports = Post
