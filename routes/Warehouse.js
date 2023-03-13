const express = require('express')
const router = express.Router()

const WarehouseController = require('../apis/WarehouseController')

router.post('/register', WarehouseController.warehouseRegister)

module.exports = router
