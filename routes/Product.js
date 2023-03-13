const express = require('express')
const router = express.Router()
const AdminController = require('../apis/AdminController')
const ProductCntroller = require('../apis/ProductController')

router.post(
  '/category',
  AdminController.verifyToken,
  AdminController.isAdmin,
  ProductCntroller.category,
)

router.post(
  '/:id',
  AdminController.verifyToken,
  AdminController.isAdmin,
  ProductCntroller.product,
)

router.put(
  '/:id',
  AdminController.verifyToken,
  AdminController.isAdmin,
  ProductCntroller.productUpdate,
)

router.post(
  '/upload',
  AdminController.verifyToken,
  AdminController.isAdmin,
  ProductCntroller.upload,
)

router.delete(
  '/:id',
  AdminController.verifyToken,
  ProductCntroller.productDelete,
)

router.get(
  '/getProduct',
  AdminController.verifyToken,
  AdminController.isAdmin,
  ProductCntroller.getProduct,
)

module.exports = router
