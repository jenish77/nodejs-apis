const jwt = require('jsonwebtoken')
const redis = require('redis')
const { client } = require('../redis')

module.exports = async (req, res, next) => {
  try {
    // const token = req.header('token')
    const bearerHeader = req.headers['authorization']

    const bearer = bearerHeader.split(' ')

    const token = bearer[1]

    if (!token) return res.status(403).send('Access denied.')

    const value = await client.get(`blacklist:${token}`)
    if (value)
      return res.status(401).send({ message: 'You are Logout, Please login  ' })

    const decoded = jwt.verify(token, 'important')

    req.userId = decoded.usrId
    console.log('here')
    next()
  } catch (error) {
    console.log(error)
    res.status(400).send('Invalid token')
  }
}
