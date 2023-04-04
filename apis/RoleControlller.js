const Role = require('../models/Role')
const Permission = require('../models/permission')
const Userrole = require('../models/Userrole')
const Admin = require('../models/Admin')

const role = async (req, res, next) => {
  let addrole = new Role({
    role: req.body.role,
  })
  await addrole.save()
  res.json({ message: 'role created successfully.' })
}

const permission = async (req, res, next) => {
  let addpermission = new Permission({
    PermissionName: req.body.permission,
  })
  await addpermission.save()

  res.json({ message: 'permission granted' })
}

const userrole = async (req, res, next) => {
  const roleId = req.params.id

  let adduserrole = new Userrole({
    roleId: roleId,
    permissionId: req.body.permissionId,
  })
  await adduserrole.save()
  res.json({ message: 'role with permission assigned' })
}

const updatePermission = async (req, res, next) => {
  const permissionId = req.params.id

  let updateData = {
    PermissionName: req.body.PermissionName,
  }
  console.log(updateData)
  const data = await Permission.findByIdAndUpdate(permissionId, {
    $set: updateData,
  })
  res.json({ message: 'permission updated' })
}

module.exports = {
  role,
  permission,
  userrole,
  updatePermission,
}
