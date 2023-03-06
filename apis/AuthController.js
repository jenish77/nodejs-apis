// const Register = require('../models/register')

// //register user data...........................
// const registerr = async (req, res, next) => {
//   try {
//     let registor = new Register({
//       email: req.body.email,
//       password: req.body.password,
//     })

//     const res_ = await registor.save()
//     console.log(res_)
//     res.json({ success: true, data: res_ })

//     // const res = await registor.save()
//     // console.log(res)
//     // res.json({ success: true, data: res })
//   } catch (error) {
//     res.json({
//       message: 'error ocurred in register ' + error.message,
//     })
//   }
// }
// module.exports = registerr
