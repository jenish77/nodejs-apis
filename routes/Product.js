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
  '/add/:id',
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

router.get(
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

router.post(
  '/getProduct',
  AdminController.verifyToken,
  AdminController.isAdmin,
  ProductCntroller.getProducts,
)

module.exports = router
