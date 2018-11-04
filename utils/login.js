module.exports = function () {
  return new Promise ((resolve, reject) => {
    wx.login({
      success: resolve,
      fail: reject
    })
  })
}