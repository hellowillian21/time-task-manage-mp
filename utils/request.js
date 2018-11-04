const host = require('./config.js')
module.exports = function (method, path, params) {
  let access_token = wx.getStorageSync('access_token')
  let header;
  if (path == '/api/user/login') {
    header = {
      "content-type": "application/x-www-form-urlencoded"
    }
  } else if (method === "POST") {
    header = {
      "content-type": "application/x-www-form-urlencoded",
      "Authorization":  access_token
    }
  } else {
    header = {
      "content-type": "application/json",
      "Authorization":  access_token
    }
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${host}${path}`,
      method: method || 'GET',
      data: typeof (params) === 'string' ? params : Object.assign({}, params),
      header: header,
      success: resolve,
      fail: reject
    })
  })
}