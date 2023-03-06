const express = require('express')
const router = express.Router()

const WalletController = require('../apis/WalletController')
const UserPostController = require('../apis/UserPostController')

router.post(
  '/register',
  UserPostController.verifyToken,
  WalletController.register,
)

router.post(
  '/deposit',
  UserPostController.verifyToken,
  WalletController.deposit,
)

router.post(
  '/withdraw',
  UserPostController.verifyToken,
  WalletController.withdraw,
)

router.post(
  '/transaction',
  UserPostController.verifyToken,
  WalletController.transaction,
)

router.get(
  '/getTransaction',
  UserPostController.verifyToken,
  WalletController.getTransaction,
)
module.exports = router
