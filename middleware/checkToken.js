const express = require('express')
var cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const appp = express()

appp.use(cookieParser())

const checkToken = async (req, res, next) => {
  // function checkToken(req, res) {
  //get authcookie from request
  // const authcookie = req.cookies.jwt
  const authcookie = req.cookies
  console.log(authcookie)
  //verify token which is in cookie value
  jwt.verify(authcookie, 'important', (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else if (data.user) {
      req.user = data.user
      next()
    }
  })
}

module.exports = { checkToken }
