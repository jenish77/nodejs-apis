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

module.exports = router
