const express = require('express')
const router = express.Router()

const AdminController = require('../apis/AdminController')
const OrderController = require('../apis/OrderController')
const UserPostController = require('../apis/UserPostController')

router.post(
  '/:id',
  UserPostController.verifyToken,
  //   AdminController.verifyToken,
  //   AdminController.isAdmin,
  OrderController.order,
)

router.get(
  '/getOrder/:id',
  UserPostController.verifyToken,
  OrderController.getOrder,
)

module.exports = router
