const mongoose = require('mongoose')

const Schema = mongoose.Schema

const permissionSchema = new Schema({
  PermissionName: {
    type: String,
  },
})

const Permission = mongoose.model('permission', permissionSchema)
module.exports = Permission

// module.exports = mongoose.model('Permission', permissionSchema)
