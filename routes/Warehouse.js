const express = require('express')
const router = express.Router()

const WarehouseController = require('../apis/WarehouseController')
const AdminController = require('../apis/AdminController')

router.post(
  '/register',
  AdminController.verifyToken,
  WarehouseController.warehouseRegister,
)

router.post('/add/:id', WarehouseController.warehouseProductadd)

router.post('/transfer', WarehouseController.transfer)

router.post('/getProduct', WarehouseController.getProduct)

router.post('/product', WarehouseController.product)

module.exports = router
