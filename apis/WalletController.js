const jwt = require('jsonwebtoken')
const User = require('../models/User')
const mongoose = require('mongoose')
const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transection')

const uuid = require('uuid')

const genrateUniqueWalletKey = async () => {
  let walletKey = ''
  let exist = true

  const walletKeyLength = 8
  const string =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  while (exist) {
    walletKey = ''
    for (let i = 0; i < walletKeyLength; i++) {
      walletKey += string.charAt(Math.floor(Math.random() * string.length))
    }
    exist = await Wallet.findOne({ walletKey: walletKey })
  }

  return walletKey
}

const register = async (req, res, next) => {
  try {
    const userId = req.headers.userid
    const key = await genrateUniqueWalletKey()

    const user = await Wallet.findOne({ user_id: userId })

    if (!user) {
      const newUser = new Wallet({
        user_id: userId,
        amount: req.body.amount,
        walletKey: key,
      })

      await newUser.save()

      res.json({ message: 'wallet register success.' })
    } else {
      res.json({ message: 'alredy Registerd for payment' })
    }
  } catch (error) {
    return res
      .json({ message: error.message ?? 'something went wrong' })
      .status(403)
  }
}

//deposit money in wallet
const deposit = async (req, res, next) => {
  let uuuid = uuid.v4()
  try {
    let userId = req.headers.userid
    const { amount } = req.body
    if (!amount) throw new Error('please add amount')
    const Data = await Wallet.findOne({ user_id: userId })

    const updateData = await Wallet.findByIdAndUpdate(
      { _id: Data._id },
      { $set: { amount: amount + Data.amount } },
      //{ new: true },
    )
    if (updateData) {
      let transaction = new Transaction({
        transactionType: 'CR',
        userId: userId,
        transactionUserId: Data.user_id,
        purpose: 'deposite',
        reference: uuuid,
        amount: amount,
      })
      await transaction.save()
    }
    res.json({ message: 'amount deposite successfully.' })
  } catch (error) {
    return res
      .json({ message: error.message ?? 'something went wrong' })
      .status(403)
  }
}

const withdraw = async (req, res, next) => {
  let uuuid = uuid.v4()
  try {
    const userId = req.headers.userid
    amount = req.body.amount

    if (!amount) {
      return res.status(400).send({ message: 'Please  add valid amount' })
    }

    const Data = await Wallet.findOne({ user_id: userId })
    try {
      if (Data.amount < amount) {
        return res.json({ message: 'Enter sufficient amount' })
      }
      const updateData = await Wallet.findByIdAndUpdate(
        { _id: Data._id },
        {
          $set: {
            amount: Data.amount - amount,
          },
        },
        // { new: true },
      )
      if (updateData) {
        let transaction = new Transaction({
          transactionType: 'DR',
          userId: userId,
          transactionUserId: Data.user_id,
          purpose: 'withdraw',
          reference: uuuid,
          amount: amount,
        })
        await transaction.save()
      }
    } catch (error) {
      return res
        .json({ message: error.message ?? 'something went wrong' })
        .status(403)
    }

    res.json({ message: 'amount withdraw successfully.' })
  } catch (error) {
    return res
      .json({ message: error.message ?? 'something went wrong' })
      .status(403)
  }
}

const transaction = async (req, res, next) => {
  try {
    let amount = req.body.amount
    let userId = req.headers.userid
    let key = req.body.walletKey
    let uuuid = uuid.v4()

    const Data = await Wallet.findOne({ walletKey: key })

    if (!Data) throw new Error('user not found')

    if (userId.toString() === Data.user_id.toString())
      throw new Error("you can't transfer yourself")

    let rData = await Wallet.findByIdAndUpdate(
      { _id: Data._id },
      { $set: { amount: Data.amount + amount } },
      { new: true },
    )
    if (rData) {
      let sTransaction = new Transaction({
        transactionType: 'DR',
        userId: userId,
        transactionUserId: Data.user_id,
        purpose: 'transfer',
        reference: uuuid,
        amount: amount,
      })
      let rTransaction = new Transaction({
        transactionType: 'CR',
        userId: Data.user_id,
        transactionUserId: userId,
        purpose: 'transfer',
        reference: uuuid,
        amount: amount,
      })

      await sTransaction.save()
      await rTransaction.save()
    }

    res.json({ message: 'transaction successfully' })
  } catch (error) {
    return res
      .json({ message: error.message ?? 'something went wrong' })
      .status(403)
  }
}

const getTransaction = async (req, res, next) => {
  const userId = req.headers.userid
  const { page = 1, limit = 10 } = req.query

  try {
    const data = await Transaction.find({ userId: userId })

    const docs = await Transaction.aggregate([
      {
        $match: { userId: mongoose.Types.ObjectId(userId) },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'transactionUserId',
          foreignField: '_id',
          as: 'transactionUser',
        },
      },
      { $unwind: '$transactionUser' },
      {
        $project: {
          id: 1,
          transactionType: 1,
          amount: 1,
          purpose: 1,
          transactionUserName: '$transactionUser.name',
          email: '$transactionUser.email',
        },
      },
    ])
      .limit(limit * page)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
    res.send(docs)
  } catch (error) {
    return res
      .json({ message: error.message ?? 'something went wrong' })
      .status(403)
  }
}

module.exports = { register, deposit, withdraw, transaction, getTransaction }
