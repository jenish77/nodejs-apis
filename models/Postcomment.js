const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema(
  {
    comment: { type: String },
    post_id: { type: mongoose.Types.ObjectId, ref: 'Post' },
    user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

const Comment = mongoose.model('comment', commentSchema)
module.exports = Comment
