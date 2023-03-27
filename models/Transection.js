const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransactionSchema = new Schema(
  {
    transactionType: { type: String, enum: ['CR', 'DR'] },
    userId: { type: mongoose.Schema.Types.ObjectId },
    transactionUserId: { type: mongoose.Schema.Types.ObjectId },
    purpose: { type: String },
    reference: { type: String }, //uuid4

    amount: { type: Number },
  },
  { timestamps: true },
)

const Transaction = mongoose.model('transaction', TransactionSchema)

module.exports = Transaction
