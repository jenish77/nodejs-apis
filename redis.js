const redis = require('redis')
const client = redis.createClient()
client
  .connect()
  .then(() => {
    console.log('redis client is connected')
  })
  .catch(() => {
    console.log('redis client is not connected')
  })

module.exports = { client }
