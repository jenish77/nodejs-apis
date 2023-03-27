const jwt = require('jsonwebtoken')
const User = require('../models/User')
const mongoose = require('mongoose')
const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transection')
const Validator = require('validatorjs')

const apiResponse = require('../response')

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

//register wallet
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
      let obj = {
        status: 'true',
        message: 'wallet register success.',
      }

      return res.json(apiResponse(obj))
      // res.json({ message: 'wallet register success.' })
    } else {
      res.json({ message: 'already Registerd for payment' })
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

    const data = {
      amount: amount,
    }
    const rules = {
      amount: 'required|integer',
    }

    const validator = new Validator(data, rules)

    if (validator.fails()) {
      let transformed = {}

      Object.keys(validator.errors.errors).forEach(function (key, val) {
        transformed[key] = validator.errors.errors[key][0]
      })

      const responseObject = {
        status: 'false',
        message: transformed,
      }
      return res.json(apiResponse(responseObject))
    }

    // if (!amount || amount < 0) throw new Error('please add valid amount')
    if (amount < 0) {
      res.json({ message: 'please add valid amount' })
    }

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
    let obj = {
      status: 'true',
      message: 'amount deposite successfully.',
    }

    return res.json(apiResponse(obj))
    // res.json({ message: 'amount deposite successfully.' })
  } catch (error) {
    return res
      .json({ message: error.message ?? 'something went wrong' })
      .status(403)
  }
}

//withdraw money from wallet
const withdraw = async (req, res, next) => {
  let uuuid = uuid.v4()
  try {
    const userId = req.headers.userid
    amount = req.body.amount

    const data = {
      amount: amount,
    }
    const rules = {
      amount: 'required|integer',
    }

    const validator = new Validator(data, rules)

    if (validator.fails()) {
      let transformed = {}

      Object.keys(validator.errors.errors).forEach(function (key, val) {
        transformed[key] = validator.errors.errors[key][0]
      })

      const responseObject = {
        status: 'false',
        message: transformed,
      }
      return res.json(apiResponse(responseObject))
    }

    if (amount < 0) {
      res.json({ message: 'please add valid amount' })
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

      let obj = {
        status: 'true',
        message: 'amount withdraw successfully.',
      }

      return res.json(apiResponse(obj))
    } catch (error) {
      return res
        .json({ message: error.message ?? 'something went wrong' })
        .status(403)
    }

    // res.json({ message: 'amount withdraw successfully.' })
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

    const data = {
      amount: amount,
      key: key,
    }
    const rules = {
      amount: 'required',
      key: 'required',
    }

    const validator = new Validator(data, rules)

    if (validator.fails()) {
      let transformed = {}

      Object.keys(validator.errors.errors).forEach(function (key, val) {
        transformed[key] = validator.errors.errors[key][0]
      })

      const responseObject = {
        status: 'false',
        message: transformed,
      }
      return res.json(apiResponse(responseObject))
    }

    const Data = await Wallet.findOne({ walletKey: key })
    const aData = await Wallet.findOne({ user_id: userId })

    if (aData.amount < 0) {
      return res.json({ message: 'Enter valid amount' })
    }

    if (!Data) {
      return res.json({ message: 'user not found' })
    }

    if (userId.toString() === Data.user_id.toString()) {
      return res.json({ message: `you can't transfer yourself` })
    }
    s

    if (aData.amount < amount) {
      return res.json({ message: 'Enter sufficient amount' })
    }

    let rData = await Wallet.findByIdAndUpdate(
      { _id: Data._id },
      { $set: { amount: Data.amount + amount } },
    )

    let sdata = await Wallet.findByIdAndUpdate(
      { _id: aData._id },
      { $set: { amount: aData.amount - amount } },
    )

    if (rData) {
      let sTransaction = new Transaction({
        transactionType: 'DR',
        userId: userId, // sender
        transactionUserId: Data.user_id, //receiver
        purpose: 'transfer',
        reference: uuuid,
        amount: amount,
      })
      let rTransaction = new Transaction({
        transactionType: 'CR',
        userId: Data.user_id, // receiver
        transactionUserId: userId, //sender
        purpose: 'transfer',
        reference: uuuid,
        amount: amount,
      })

      await sTransaction.save()
      await rTransaction.save()
    }
    let obj = {
      status: 'true',
      message: 'transaction successfully',
    }

    return res.json(apiResponse(obj))
    // res.json({ message: 'transaction successfully' })
  } catch (error) {
    return res
      .json({ message: error.message ?? 'something went wrong' })
      .status(403)
  }
}

// transaction history
const getTransaction = async (req, res, next) => {
  const userId = req.headers.userid
  const { page = 1, limit = 10 } = req.query

  try {
    // const data = await Transaction.find({ userId: userId })

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
