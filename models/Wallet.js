const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const walletSchema = new Schema(
  {
    user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    walletKey: { type: String, unique: true },
  },
  { timestamps: true },
)

// walletSchema.pre('save', async function (next) {
//   try {
//     const salt = await bcrypt.genSalt(10)
//     const hashPassword = await bcrypt.hash(this.password, salt)
//     this.password = hashPassword
//     next()
//   } catch (error) {
//     next(error)
//   }
// })

const Wallet = mongoose.model('wallet', walletSchema)
module.exports = Wallet
