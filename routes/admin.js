const express = require('express')
const router = express.Router()

const AdminController = require('../apis/AdminController')

router.post('/register', AdminController.register)
router.post('/login', AdminController.login)
router.get('/show', AdminController.verifyToken, AdminController.show)
router.delete('/delete/:id', AdminController.destroy)

router.post('/category', AdminController.verifyToken, AdminController.category)

router.post(
  '/product/:id',
  AdminController.verifyToken,
  //   AdminController.isAdmin,
  AdminController.product,
)

router.get(
  '/productUpdate/:id',
  AdminController.verifyToken,
  AdminController.productUpdate,
)

router.get('/upload', AdminController.verifyToken, AdminController.upload)

router.delete(
  '/productDelete/:id',
  AdminController.verifyToken,
  AdminController.productDelete,
)

router.get(
  '/getProduct',
  AdminController.verifyToken,
  AdminController.getProduct,
)

module.exports = router
