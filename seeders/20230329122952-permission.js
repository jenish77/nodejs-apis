'use strict'

const Permission = require('../models/permission')

module.exports = {
  up: async (models, mongoose) => {
    try {
      await Permission.deleteMany({})
      console.log('All permissions deleted successfully')

      const permissions = [
        { PermissionName: 'create_product' },
        { PermissionName: 'update_product' },
        { PermissionName: 'delete_product' },
      ]

      // const addpermission = await Permission.create({
      //   PermissionName: 'update_product',
      // })
      await Permission.create(permissions, { insertMany: true })

      console.log(
        `Permission ${addpermission.PermissionName} created successfully`,
      )
    } catch (error) {
      console.error(`Error creating permission: ${error}`)
    }
  },
}
