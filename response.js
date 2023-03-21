module.exports = (res) => {
  return {
    status: res.status,
    message: res.message,
    data: res.data,
  }
}
