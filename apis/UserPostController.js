const User = require('../models/User')
const Post = require('../models/Post')
let PostLike = require('../models/Postlike')
const Comment = require('../models/Postcomment')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const multer = require('multer')
const Validator = require('validatorjs')

const apiResponse = require('../response')

// REGISTER API

const register = async (req, res, next) => {
  try {
    const { email, name, password } = req.body
    const data = {
      name: name,
      email: email,
      password: password,
    }
    const rules = {
      name: 'required|string',
      email: 'required|string|email',
      password: [
        'required',
        'regex:/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/',
      ],
    }
    const validator = new Validator(data, rules)

    if (validator.fails()) {
      let transformed = {}

      Object.keys(validator.errors.errors).forEach(function (key, val) {
        transformed[key] = validator.errors.errors[key][0]
      })

      const responseObject = {
        status: 'false',
        message: transformed,
      }
      return res.json(apiResponse(responseObject))
    }

    const eid = await User.findOne({ email: req.body.email })
    if (eid) {
      res.json({ message: 'email already exist' })
    } else {
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      })
      const res_ = await user.save()

      let obj = {
        status: 'true',
        message: 'register successfully',
      }

      return res.json(apiResponse(obj))
    }
  } catch (error) {
    res.json({
      message: 'HERE' + error.message,
    })
  }
}

// delete the user data
const destroy = async (req, res, next) => {
  let userId = req.headers.userid
  try {
    const deletee = await User.findOneAndRemove({ _id: userId })
    console.log(deletee)

    let obj = {
      status: 'true',
      message: 'Deleted successfully',
    }

    res.json(apiResponse(obj))

    // const eid = await Employee.findOne({ email: req.body.email })
    // if (!eid) {
    //   res.json({ message: 'Email already deleted' })
    // }
  } catch (error) {
    res.json({
      message: 'error ocurred during delete the database.' + error.message,
    })
  }
}

const secretKey = 'important'

// LOGIN API
const login = async (req, res, next) => {
  const { email, password } = req.body

  const data = {
    email: email,
    password: password,
  }
  // console.log(password)
  const rules = {
    email: 'required|string|email',
    password: [
      'required',

      // 'regex:/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/',
    ],
  }

  const validator = new Validator(data, rules)

  if (validator.fails()) {
    let transformed = {}
    Object.keys(validator.errors.errors).forEach(function (key, val) {
      transformed[key] = validator.errors.errors[key][0]
    })
    const responseObject = {
      status: 'false',
      message: transformed,
    }
    return res.json(apiResponse(responseObject))
  }

  // if (!email || !password) {
  //   throw new Error('email or password required')
  // }
  const checkEmail = await User.findOne({ email: email })
  // if (!checkEmail) throw new Error('email is not register with db')
  if (!checkEmail) {
    return res.json({ message: 'email is not register with db ' })
  }

  if (!(email && (await bcrypt.compare(password, checkEmail.password)))) {
    return res.json({ message: 'please enter valid email and password' })
  }

  // CREATE TOKEN
  jwt.sign(
    { usrId: checkEmail._id },
    secretKey,
    { expiresIn: '1h' },
    (err, token) => {
      if (err) throw new Error('somethin went wrong')
      if (token) {
        res.json({ token })
      }
    },
  )
}

//VERIFY TOKEN
const verifyToken = async (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    const token = bearer[1]

    jwt.verify(token, secretKey, (err, authData) => {
      if (err) {
        res.json({ message: 'Invalidate token' + err.message })
      } else {
        req.headers.userid = authData.usrId
        next()
      }
    })
  } else {
    res.json({
      result: 'Tokenn is not valid',
    })
  }
}

const show = async (req, res, next) => {
  let userId = req.headers.userid
  if (!userId) {
    throw new Error('Id is missing')
  }

  try {
    const show = await User.findById(userId)
    if (!show) {
      res.json({ message: 'user not found' })
    }
    res.send({
      name: show.name,
      email: show.email,
      id: show._id,
    })
  } catch (error) {
    res.json({
      message: 'error ocurred in access data' + error.message,
    })
  }
}

//update the user data
const update = async (req, res, next) => {
  const { email, name } = req.body

  const data = {
    name: name,
    email: email,
  }

  const rules = {
    name: 'required|string',
    email: 'required|string|email',
  }
  const validator = new Validator(data, rules)

  if (validator.fails()) {
    let transformed = {}
    Object.keys(validator.errors.errors).forEach(function (key, val) {
      transformed[key] = validator.errors.errors[key][0]
    })

    const responseObject = {
      status: 'false',
      message: transformed,
    }
    return res.json(apiResponse(responseObject))
  }

  // if (!email || !name) {
  //   return res.send({ message: 'please add mandatory feild' })
  // }
  let id = req.headers.userid
  let updateData = {
    name: req.body.name,
    email: req.body.email,
  }
  try {
    const updatee = await User.findByIdAndUpdate(id, {
      $set: updateData,
    })
    let obj = {
      status: 'true',
      message: 'updated successfully',
    }

    return res.json(apiResponse(obj))
    // res.json({ message: 'updated successfully' })
  } catch (error) {
    res.json({
      message: 'error ocurred during update the data' + error.message,
    })
  }
}

//Forgot password
const Fpassword = async (req, res, next) => {
  const { email } = req.body

  const data = {
    email: email,
  }
  const rules = {
    email: 'required|email',
  }

  const validator = new Validator(data, rules)

  if (validator.fails()) {
    let transformed = {}

    Object.keys(validator.errors.errors).forEach(function (key, val) {
      transformed[key] = validator.errors.errors[key][0]
    })
    const responseObject = {
      status: 'false',
      message: transformed,
    }
    return res.json(apiResponse(responseObject))
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ error: 'User with this email does not exist.' })
    }
    // console.log(user)
    try {
      const token = jwt.sign({ _id: user._id }, 'topsecret', {
        expiresIn: '1h',
      })
      // console.log('uuuuuu=', user._id)
      // console.log('tokenva', token)
      return User.findByIdAndUpdate(
        user._id, //-------
        { resetLink: token },
        (err, success) => {
          if (err) {
            return res.status(400).json({ error: 'reset password link error.' })
          } else {
            res.json({ token })
          }
        },
      )
    } catch (error) {
      res.json({
        message: 'error ocurred.' + error.message,
      })
    }
  })
}

// reset password in user
const resetpassword = async (req, res, next) => {
  const securePassword = async (password) => {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  }
  try {
    const token = req.body.resetLink
    // console.log(token)
    // const tokenData = await Employee.findOne({ token: token })
    const tokenData = await User.findOne({ resetLink: token })
    if (!tokenData) {
      return res.json({ message: 'Link is not valid' })
    }
    console.log('tokendataId,', tokenData._id)
    if (tokenData) {
      const password = req.body.newPass
      const newPassword = await securePassword(password)

      const userData = await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: '' } },
        { new: true },
      )
      let obj = {
        status: 'true',
        message: 'password reset successfully',
      }

      return res.json(apiResponse(obj))
      // res.status(200).json({ userData })
    }
  } catch (error) {
    res.json({
      message: 'error ocurred.' + error.message,
    })
  }
}

// change password for user
const changePassword = async (req, res, next) => {
  let id = req.headers.userid

  if (!id) {
    res.json({ error: 'please login using correct email and password' })
  }
  const data = await User.findOne({ _id: id })
  // console.log(data)
  const opassword = req.body.oldpassword
  const npassword = req.body.newpassword
  const cpassword = req.body.confirmpassword
  console.log(opassword, '+', npassword, '+', cpassword)

  const datas = {
    opassword: opassword,
    npassword: npassword,
    cpassword: cpassword,
  }
  const rules = {
    opassword: 'required',
    npassword: [
      'required',
      'regex:/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/',
    ],
    cpassword: [
      'required',
      'regex:/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/',
    ],
  }
  const validator = new Validator(datas, rules)

  if (validator.fails()) {
    let transformed = {}

    Object.keys(validator.errors.errors).forEach(function (key, val) {
      transformed[key] = validator.errors.errors[key][0]
    })

    const responseObject = {
      status: 'false',
      message: transformed,
    }
    return res.json(apiResponse(responseObject))
  }

  // if (!opassword || !npassword || !cpassword) {
  //   return res.status(400).send({ message: 'please andd mandatory field' })
  // }

  if (npassword !== cpassword) {
    return res
      .status(400)
      .send({ message: 'new password and confirm password must be same' })
  }

  if (opassword === npassword) {
    return res
      .status(400)
      .send({ message: 'old password and new password not be same' })
  }

  let result = bcrypt.compareSync(opassword, data.password)
  if (!result) {
    return res.status(400).send({ message: 'old password must be correct' })
  }
  const securePassword = async (password) => {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  }

  const newPassword = await securePassword(npassword)
  const userData = await User.findByIdAndUpdate(
    { _id: data._id },
    { $set: { password: newPassword, token: '' } },
    // { new: true },
  )

  let obj = {
    status: 'true',
    message: 'Password change successfully',
  }

  return res.json(apiResponse(obj))

  // return res.status(200).json({ userData })
}

//upload post
const upload = async (req, res, next) => {
  uploads(req, res, (err) => {
    if (err) {
      console.log(err)
    } else {
      const newImage = new Post({
        name: req.body.name,
        postimage: req.file.filename,
        like: req.body.like,
        userid: req.headers.userid,
      })

      newImage
        .save()

        .then(() =>
          res.json(
            `_id: ${newImage._id} , imageurl:http://localhost:3000/image/${req.file.filename}`,
          ),
        )
        .catch((err) => res.send({ err }))
    }
  })
}

const Storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '_' + Date.now() + path.extname(file.originalname),
    )
  },
})

const uploads = multer({
  storage: Storage,
  //   fileFilter,
}).single('testImage')

const express = require('express')
const appp = express()
appp.use('/image', express.static('public/uploads/'))

const mongoose = require('mongoose')
const Like = require('../models/Postlike')
const { error } = require('console')
const app = require('../app')
const path = require('path')

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @description "like post"
 */

const like = async (req, res, next) => {
  try {
    let postId = req.params.postId
    let userId = req.headers.userid

    const postData = await Post.findById(postId)
    // if (!postData) throw new Error('post not found')
    if (!postData) {
      return res.json({ message: 'post not found' })
    }

    if (userId.toString() === postData.userid.toString())
      throw new Error("you can't like post by yourself")

    let likedata = await Like.findOne({ user_id: userId, post_id: postId })
    if (!likedata) {
      let setlike = new Like({
        post_id: postId,
        user_id: userId,
      })
      await setlike.save()
      let countlike = await Like.find({ post_id: postId }).count()
      const responseObject = {
        status: 'true',
        message: ` 'like successfully','total like in this post: ${countlike}' `,
      }
      return res.json(apiResponse(responseObject))
      // res.json({
      //   message: ` 'like successfully','total like in this post: ${countlike}' `,
      // })
    } else {
      await Like.findByIdAndRemove(likedata._id)
      let countlike = await Like.find({ post_id: postId }).count()
      const responseObject = {
        status: 'true',
        message: ` 'dislike successfully','total like in this post: ${countlike}' `,
      }
      return res.json(apiResponse(responseObject))
      // return res.json({
      //   message: ` 'dislike successfully','total like in this post: ${countlike}' `,
      // })
    }
  } catch (error) {
    return res
      .json({ message: error.message ?? 'something went wrong' })
      .status(403)
  }
}

//comment on the post
const comment = async (req, res, next) => {
  try {
    let postId = req.params.postid
    let userId = req.headers.userid
    let comment = req.body.comment
    const data = {
      comment: comment,
    }
    const rules = {
      comment: 'required',
    }
    const validator = new Validator(data, rules)
    if (validator.fails()) {
      let transformed = {}

      Object.keys(validator.errors.errors).forEach(function (key, val) {
        transformed[key] = validator.errors.errors[key][0]
      })

      const responseObject = {
        status: 'false',
        message: transformed,
      }
      return res.json(apiResponse(responseObject))
    }

    let postData = await Post.findById(postId)
    if (!postData) throw new Error('Post not found')

    let commentData = await Comment.findOne({
      user_id: userId,
      post_id: postId,
    })
    if (!commentData) {
      let setcomment = new Comment({
        post_id: postId,
        user_id: userId,
        comment: comment,
      })
      await setcomment.save()
      let com = await Comment.find({ post_id: postId })
      res.json({ comment: com })
    } else {
      let obj = {
        status: 'true',
        message: 'you alredy comment on this post',
      }

      return res.json(apiResponse(obj))
      // res.json({ message: 'you alredy comment on this post' })
    }
  } catch (error) {
    return res
      .json({ message: error.message ?? 'something went wrong' })
      .status(403)
  }
}

//delete COMMENT on the post
const deleteComment = async (req, res, next) => {
  let postId = req.params.postid
  let userId = req.headers.userid

  let postData = await Post.findById(postId)
  if (!postData) throw new Error('Post not found')

  let commentData = await Comment.findOne({
    user_id: userId,
    post_id: postId,
  })
  if (!commentData) {
    res.json({ message: 'comment does not exist' })
  } else {
    await Comment.findByIdAndRemove(commentData._id)

    let obj = {
      status: 'true',
      message: 'delete comment successfully.',
    }

    return res.json(apiResponse(obj))

    // res.json({ message: 'delete comment successfully.' })
  }
}

const pagination = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query
  let userId = req.headers.userid

  try {
    const show = await Post.find({ userId })
      .select('-postimage')
      .limit(limit * page)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
    res.json({ show })
  } catch (error) {
    res.json({
      message: 'error ocurred in access data' + error.message,
    })
  }
}

const getPost = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query

  try {
    const docs = await Post.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userid',
          foreignField: '_id',
          as: 'userData',
        },
      },
      { $unwind: '$userData' },

      //&&&&&&&&
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'post_id',
          as: 'totalLikes',
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post_id',
          as: 'totalComments',
        },
      },
      {
        $project: {
          id: '$userData._id',
          Name: '$userData.name',
          email: '$userData.email',
          id: 1,
          name: 1,
          // totalLikes: 1,
          Likes: { $size: '$totalLikes' },
          Comments: { $size: '$totalComments' },
        },
      },

      //&&&&&&&&&&

      // { $skip: Number(page) },
      // { $limit: Number(limit) },
    ])

    res.send(docs)
  } catch (error) {
    res.json({
      message: 'error ocurred in access data' + error.message,
    })
  }
}

const likedata = async (req, res, next) => {
  try {
    const doc = await Post.aggregate([
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'post_id',
          as: 'totalLikes',
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post_id',
          as: 'totalComments',
        },
      },
      {
        $project: {
          totalLikes: 1,
          Likes: { $size: '$totalLikes' },
          Comments: { $size: '$totalComments' },
        },
      },
    ])

    res.send(doc)
  } catch (error) {
    res.json({
      message: 'error ocurred in likedata' + error.message,
    })
  }
}

const latestPost = async (req, res, next) => {
  try {
    const postdata = await Post.find().sort({ createdAt: -1 })
    res.json({ data: postdata })
  } catch (error) {
    res.json({
      message: 'error ocurred in access data' + error.message,
    })
  }
}

const countlike = async (req, res, next) => {
  let postId = req.params.postid
  //   console.log(postId)

  let countlikeuser = await Like.find({ post_id: postId })
  let countlike = await Like.find({ post_id: postId }).count()

  let userlikes = await countlikeuser.forEach((element) => {
    // console.log(element.user_id)
  })

  //   console.log(countlikeuser)
  res.json({ countlike })

  //   res.json({ message: 'count like' })
}

const getimage = async (req, res, next) => {
  let postid = req.params.postid
  //   console.log(postid)
  let image = await Post.findOne({ postid })
  if (!image) {
    return res.json({ message: 'post not found' })
  }
  //   console.log(image.name)

  res.json({ image })

  //   res.json({ message: 'here is your image' })
}

module.exports = {
  register,
  destroy,
  login,
  show,
  verifyToken,
  update,
  Fpassword,
  resetpassword,
  changePassword,
  upload,
  like,
  countlike,
  getimage,
  comment,
  deleteComment,
  pagination,
  getPost,
  latestPost,
  likedata,
}
