const express = require('express')
const router = express.Router()
// const AuthController = require('../apis/AuthController')
const UserController = require('../apis/UserController')
// const Login = require('../apis/login')

router.get('/', UserController.index)
router.get('/show', UserController.verifyToken, UserController.show)
router.post('/register', UserController.register)
router.post('/login', UserController.login)

router.post('/upload', UserController.upload)
router.put('/Fpassword', UserController.Fpassword)
router.put('/resetpassword', UserController.resetpassword)
router.put(
  '/changePassword',
  UserController.verifyToken,
  UserController.changePassword,
)
router.post('/logout', UserController.verifyToken, UserController.logout)
// router.post('/login', Login.login)

router.put('/update', UserController.verifyToken, UserController.update)
router.delete('/delete', UserController.verifyToken, UserController.destroy)

module.exports = router
