const express = require('express')
const router = express.Router()
const roleController = require('../apis/RoleControlller')

router.post('/createrole', roleController.role)

router.post('/permission', roleController.permission)

router.post('/userrole/:id', roleController.userrole)

router.put('/update/:id', roleController.updatePermission)

module.exports = router
