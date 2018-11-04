Page({
  bindGetUserInfo: function (e) {
    console.log(e.detail,'拿到用户信息')
    if (e.detail.userInfo) {
      wx.setStorageSync('userInfo', e.detail.userInfo)
      wx.navigateBack();
    }
  }
})