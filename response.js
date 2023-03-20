module.exports = (res) => {
  return {
    status: res.statusCode,
    message: res.message,
    data: res.data,
  }
}
