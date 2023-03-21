const Employee = require('../models/Employee')
const jwt = require('jsonwebtoken')
const Image = require('../models/image')

//show the employee
const index = (req, res, next) => {
  Employee.find()
    .then((response) => {
      res.json({
        response,
      })
    })
    .catch((error) => {
      res.json({
        message: 'error ocurred',
      })
    })
}

const show = async (req, res, next) => {
  let employeeId = req.headers.userid
  if (!employeeId) {
    throw new Error('Id is missing')
  }
  console.log(employeeId)
  try {
    const show = await Employee.findById(employeeId)
    // console.log(show)
    res.send({
      name: show.name,
      email: show.email,
      age: show.age,
      // password: show.password,
    })
  } catch (error) {
    res.json({
      message: 'error ocurred in access data' + error.message,
    })
  }
}

//Register new data in database
const bcrypt = require('bcrypt')
const { error } = require('console')

const register = async (req, res, next) => {
  try {
    const { email, name, password, age } = req.body
    if (!email || !name || !password || !age)
      throw new Error(':- Please add data or mandatory field')

    const eid = await Employee.findOne({ email: req.body.email })
    if (eid) {
      res.json({ message: 'Email already exist' })
    } else {
      let employee = new Employee({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        password: req.body.password,
      })
      const res_ = await employee.save()
      console.log(res_)
      res.json({ message: 'New Data added succesfully' })
    }
  } catch (error) {
    res.json({
      message: 'error ocurred in add data-' + error.message,
    })
  }
}

// login page...............
const secretKey = 'secretkey'
const login = async (req, res, next) => {
  // try {
  //TODO::make validation first Like: email, password
  //TODO:: check email in db is exist or not
  //TODO:: if not exist then return with error "email is not exist in db"
  //TODO:: if exist then check password => if wrong "then give error password is not valid"
  //TODO:: if password is matched then give user to token

  try {
    const { email, password } = req.body
    if (!email || !password) {
      throw new Error('email or password is required')
    }

    const checkEmail = await Employee.findOne({ email: email })
    if (!checkEmail) throw new Error('email is not register with db')

    if (!(email && (await bcrypt.compare(password, checkEmail.password)))) {
      res.json({ message: 'please enter valid email and password' })
    }

    jwt.sign(
      { userId: checkEmail._id.toString() },
      secretKey,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw new Error('something went wrong')
        if (token) {
          res.json({ token })
        }
      },
    )
  } catch (error) {
    res.json({ message: error.message }).status(403)
  }

  // -----------
}

//----

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    const token = bearer[1]
    console.log(token)

    jwt.verify(token, secretKey, (err, authData) => {
      if (err) {
        res.json({ message: 'Inavlidate token' + err.message })
      } else {
        // console.log('userId', authData.userId)
        req.headers.userid = authData.userId //-------IMP-----
        next()
      }
    })
  } else {
    res.json({
      result: 'Tokenn is not valid',
    })
  }
}

// update the data
const update = async (req, res, next) => {
  const { email, name, password, age } = req.body
  if (!email || !name || !password || !age) {
    return res.send({ message: 'Please add data or mandatory field' })
    // throw new Error(':- Please add data or mandatory field')
  }

  let _id = req.headers.userid
  console.log('employeeId', _id)
  let updateData = {
    name: req.body.name,
    email: req.body.email,
    age: req.body.age,
  }
  try {
    const updatee = await Employee.findByIdAndUpdate(_id, {
      $set: updateData,
    })
    // console.log(updatee)
    res.json({ message: 'Updated successfully.' })
  } catch (error) {
    res.json({
      message: 'error ocurred during update the data' + error.message,
    })
  }
}

//delete the employee data

const destroy = async (req, res, next) => {
  let userId = req.headers.userid
  try {
    const deletee = await Employee.findOneAndRemove({ _id: userId })
    console.log(deletee)
    res.json({ message: 'Deleted successfully' })

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

//TODO:FOrgot password:-
//Enter email & verify
//check in database
//generate token
//update token in database  [resetlink:token]

//TODO:Reset Password
//get token
//get token data
//convert password into hash
//updatedata[token=''  ,new=true]

//TODO:change password
//check old password is correct(using bcrypt compareSync)
// & new password & confirm password field are same
//if old password matches then using bcrypt hashSync method create hashpassword
//update the new password in database using updateOne(id,hashpaasword)
//password successfully change
//create jwt token

//change password after login
const changePassword = async (req, res, next) => {
  let id = req.headers.userid

  if (!id) {
    res.json({ error: 'please login using correct email and password' })
  }
  const data = await Employee.findOne({ _id: id })
  console.log(data)
  const opassword = req.body.oldpassword
  const npassword = req.body.newpassword
  const cpassword = req.body.confirmpassword
  console.log(opassword, '+', npassword, '+', cpassword)

  if (!opassword || !npassword || !cpassword) {
    return res.status(400).send({ message: 'please andd mandatory field' })
  }

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
  const userData = await Employee.findByIdAndUpdate(
    { _id: data._id },
    { $set: { password: newPassword, token: '' } },
    { new: true },
  )
  return res.status(200).json({ userData })
}

//TODO:Image upload using multer

const multer = require('multer')
const upload = async (req, res, next) => {
  uploads(req, res, (err) => {
    if (err) {
      console.log(err)
    } else {
      const newImage = new Image({
        name: req.body.name,
        image: {
          data: req.file.filename,
          contentType: 'image/png',
        },
      })
      newImage
        .save()
        .then(() => res.send('uploaded successfully'))
        .catch((err) => console.log(err))
    }
  })
}
const Storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const uploads = multer({
  storage: Storage,
}).single('testImage')

//Forgot Password
const Fpassword = async (req, res, next) => {
  const { email } = req.body
  Employee.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ error: 'User with this email does not exist.' })
    }
    console.log(user)
    try {
      const token = jwt.sign({ _id: user._id }, 'topsecret', {
        expiresIn: '20m',
      })
      console.log('uuuuuu=', user._id)
      console.log('tokenva', token)
      return Employee.findByIdAndUpdate(
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

const resetpassword = async (req, res, next) => {
  //----------------------------------------------------
  const securePassword = async (password) => {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  }
  try {
    const token = req.body.resetLink
    console.log(token)
    // const tokenData = await Employee.findOne({ token: token })
    const tokenData = await Employee.findOne({ resetLink: token })
    console.log('tokendataId,', tokenData._id)
    if (tokenData) {
      const password = req.body.newPass
      const newPassword = await securePassword(password)
      const userData = await Employee.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: '' } },
        { new: true },
      )
      res.status(200).json({ userData })
    }
  } catch (error) {
    res.json({
      message: 'error ocurred.' + error.message,
    })
  }
}

const logout = async (req, res, next) => {
  let id = req.headers.userid
  console.log('----------------', id)
  if (!id) {
    res.status(400).send({ message: 'please login' + error.message })
    //---------------------baki
  }
}

//ADMIN
// TODO  For admin, I want to create the routes which can see the list of users,
// edit or remove users,
// check the logout time of users.
// I have also set the flag in table to identify the person is user or Admin.

//Wanderer (Someone who is just visiting our site.He should be able to access all public routes.Simple Urls/Public urls accessible to all thus need not to make a seprate role for this as it is not any authenticated right.)
// Guest (Someone who has registered but not verified say email not verified).
// User (Someone who has his verified email)
// Admin (Made a Admin by SuperAdmin after verifying.he enjoy most of rights)
// Superadmin (Master of application.He enjoy some more sophisticated rights.More rights then admin)

module.exports = {
  logout,
  resetpassword,
  Fpassword,
  changePassword,
  upload,
  index,
  show,
  register,
  update,
  destroy,
  login,
  verifyToken,
}
