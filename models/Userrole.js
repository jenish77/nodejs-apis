const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userroleSchema = new Schema(
  {
    roleId: { type: mongoose.Types.ObjectId, ref: 'Role' },
    permissionId: { type: mongoose.Types.ObjectId, ref: 'Permission' },
  },

  { timestamps: true },
)

const Userrole = mongoose.model('userrole', userroleSchema)
module.exports = Userrole
