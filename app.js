const express = require('express')
var bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()

mongoose.set('strictQuery', false)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const userRoute = require('./routes/user')
const postRoute = require('./routes/post')
const walletRoute = require('./routes/wallet')
const adminRoute = require('./routes/admin')
const productRoute = require('./routes/Product')
const WarehouseRoute = require('./routes/Warehouse')
const OrderRoute = require('./routes/Order')
const roleRoute = require('./routes/role')

app.use('/api/user', userRoute)
app.use('/api/post', postRoute)
app.use('/api/wallet', walletRoute)
app.use('/api/admin', adminRoute)
app.use('/api/product', productRoute)
app.use('/api/warehouse', WarehouseRoute)
app.use('/api/order', OrderRoute)
app.use('/api/role', roleRoute)

app.use('/image', express.static('public/uploads/'))

const PORT = 3000

app.listen(PORT, () => {
  console.log('server is listning....')
  mongoose.connect('mongodb://localhost:27017/user', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

//--------------------------
// exports.app = app
module.exports = { app }
