const express = require('express')
const router = express.Router()

const AdminController = require('../apis/AdminController')

router.post(
  '/register/:id',
  // AdminController.isAdmin(),
  AdminController.register,
)
router.post('/login', AdminController.login)
router.get(
  '/show',
  AdminController.verifyToken,
  // AdminController.isAdmin('user'),
  AdminController.show,
)
router.delete('/delete/:id', AdminController.destroy)

router.post(
  '/getProfile',
  AdminController.verifyToken,
  AdminController.getProfile,
)

module.exports = router
