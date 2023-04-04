const express = require('express')
const router = express.Router()

const WarehouseController = require('../apis/WarehouseController')
const AdminController = require('../apis/AdminController')

router.post(
  '/register',
  AdminController.verifyToken,
  // AdminController.isAdmin,
  WarehouseController.warehouseRegister,
)

router.post(
  '/add/:id',
  AdminController.verifyToken,
  // AdminController.isAdmin,
  WarehouseController.warehouseProductadd,
)

router.post(
  '/transfer',
  AdminController.verifyToken,
  // AdminController.isAdmin,
  WarehouseController.transfer,
)

router.post(
  '/getProduct',
  AdminController.verifyToken,
  // AdminController.isAdmin,
  WarehouseController.getProduct,
)

router.post(
  '/product',
  AdminController.verifyToken,
  // AdminController.isAdmin,
  WarehouseController.product,
)

module.exports = router
