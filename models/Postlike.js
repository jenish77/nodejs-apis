const mongoose = require('mongoose')
const Schema = mongoose.Schema

const likeSchema = new Schema(
  {
    like: { type: Number },
    post_id: { type: mongoose.Types.ObjectId, ref: 'Post' },
    user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

const Like = mongoose.model('like', likeSchema)
module.exports = Like
