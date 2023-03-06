const express = require('express')
var bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const EmployeeRoute = require('./routes/employee')
const AdminRoute = require('./routes/admin')

app.use('/api/employee', EmployeeRoute)
app.use('/api/admin', AdminRoute)

const PORT = 3000

app.listen(PORT, () => {
  console.log('server is listning....')
  mongoose.connect('mongodb://localhost:27017/employee', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

//--------------------------

module.exports = { app }
