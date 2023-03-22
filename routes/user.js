const express = require('express')
const router = express.Router()
const UserPostController = require('../apis/UserPostController')

router.post('/register', UserPostController.register)
router.post('/login', UserPostController.login)
router.get('/update', UserPostController.verifyToken, UserPostController.update)
router.get('/show', UserPostController.verifyToken, UserPostController.show)

router.delete(
  '/delete',
  UserPostController.verifyToken,
  UserPostController.destroy,
)

router.put('/Fpassword', UserPostController.Fpassword)
router.put('/resetpassword', UserPostController.resetpassword)

router.post('/orPassword', UserPostController.orPassword)

router.put(
  '/changePassword',
  UserPostController.verifyToken,
  UserPostController.changePassword,
)

module.exports = router
