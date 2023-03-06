const express = require('express')
const router = express.Router()

const AdminController = require('../apis/AdminController')

router.post('/register', AdminController.register)
router.post('/login', AdminController.login)
router.get('/show', AdminController.verifyToken, AdminController.show)
router.delete('/delete/:id', AdminController.destroy)

module.exports = router
