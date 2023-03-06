const express = require('express')
const router = express.Router()
const UserPostController = require('../apis/UserPostController')

router.post('/', UserPostController.verifyToken, UserPostController.upload)

router.post(
  '/:postId/like',
  UserPostController.verifyToken,
  UserPostController.like,
)
router.post('/:postid/countlike', UserPostController.countlike)

router.get('/:postid/getimage', UserPostController.getimage)

router.post(
  '/:postid/comment',
  UserPostController.verifyToken,
  UserPostController.comment,
)

router.delete(
  '/comment/:postid',
  UserPostController.verifyToken,
  UserPostController.deleteComment,
)

router.post(
  '/pagination',
  UserPostController.verifyToken,
  UserPostController.pagination,
)

router.get('/', UserPostController.getPost)

router.post('/latestPost', UserPostController.latestPost)
router.get('/likedata', UserPostController.likedata)

module.exports = router
