const express = require('express')
const router = express.Router()
const UserPostController = require('../apis/UserPostController')
// const checkTokenRevoked = require('../middleware/auth')
const auth = require('../middleware/auth')
const checkToken = require('../middleware/checkToken')

router.post('/register', UserPostController.register)
router.post('/login', UserPostController.login)
router.get(
  '/update',
  auth,
  UserPostController.verifyToken,
  UserPostController.update,
)
router.get(
  '/show',
  auth,
  // checkToken.checkToken,
  // checkTokenRevoked.checkTokenRevoked,
  UserPostController.verifyToken,
  UserPostController.show,
)

router.delete(
  '/delete',
  auth,
  UserPostController.verifyToken,
  UserPostController.destroy,
)

router.put('/Fpassword', auth, UserPostController.Fpassword)
router.put('/resetpassword', UserPostController.resetpassword)

router.post('/orPassword', UserPostController.orPassword)

router.put(
  '/logout',
  auth,
  // UserPostController.verifyToken,
  UserPostController.logout,
)

router.put(
  '/changePassword',
  UserPostController.verifyToken,
  UserPostController.changePassword,
)

module.exports = router
