//app.js
const _login = require('./utils/login')
const _getSetting = require('./utils/getSetting')
const _getUserInfo = require('./utils/getUserInfo')
const request = require('./utils/request.js')
App({
  onLaunch: function () {
    
  },
  // 测试
  test: function () {
    request('POST','/beta/tpost',{
      a: '123',
      b: 321
    })
  },
  // 登录
  login: function () {
    console.log('***调用login***')
    let that = this
    let timer
    let _code

    //显示loading
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true,
      duration: 30000
    })

    // 设置连接超时时间30s
    timer = setTimeout(function () {
      wx.showModal({
        titleL: '连接超时',
        content: '服务器出现了一些不可知的错误，或者网络出错，请稍后重试',
        showCancel: false,
        confirmText: '好的'
      })
    },30000)

    // 获取code
    _login()
    .then(res => {
      console.log('***code***', res.code)
      _code = res.code
      return _getSetting() //获取用户的当前设置
    })
    .then(res => {
      // 返回值中只会出现小程序已经向用户请求过的权限
      if (res.authSetting['scope.userInfo']) {
        return _getUserInfo()
      } else {
        wx.navigateTo({
          url: '/pages/authorize/authorize',
          success: function () {
            wx.hideToast()
            if (timer) {
              clearTimeout(timer)
            }
          }
        })
        return Promise.reject({
          notRealPromiseException: true
        })
      }
    })
    .then(res => {
      console.log('***微信的用户信息***', res)
      wx.setStorageSync('wx_userinfo', res.userInfo)
      // 获取token
      return request('POST', '/api/user/login', {
        // code: _code
        code: _code
        // type: 'weixin',
        // subtype: 'mini_app',
        // signature: res.signature,
        // iv: res.iv,
        // encryptedData: res.encryptedData
      })
    })
    .then(res => {
      wx.hideToast()
      if (timer) {
        clearTimeout(timer)
      }
      console.log('***token信息', res)
      // 缓存token
      wx.setStorageSync('access_token', res.data.data)
      let wx_userinfo = wx.getStorageSync('wx_userinfo')
      // 首次登录 写入用户信息
      if (res.data.code === 1) {
        console.log(wx_userinfo.nickName)
        request('POST', '/api/user/addUserInfo', {
          phone: '',
          nickname: wx_userinfo.nickName
        })
        // request('POST', '/api/user/addUserInfo')
        .then(res => {
          console.log(res)
          if (res.data.code === 0) {
            return request('GET', '/api/user/account')
          } else {
            return false // ????
          }
        })
        .then(res => {
          // 我方服务器用户信息
          console.log('我方服务器用户信息*',res)
        })
      } else if (res.data.code === 2) {
        request('GET', '/api/user/account')
        .then(res => {
          console.log('我方服务器用户信息',res)
        })
      } else {
        wx.showModal({
          title: '提示',
          content: `登录出错了，请稍后重试!`,
          showCancel: false,
          confirmText: '好的'
        })
        return false
      }
     

    })
    .catch(ex => {
      console.log('***EX***', ex)
    })
  },
  
  globalData: {
    userInfo: null,
    // 以下数据为初始化计时使用
    startTask: false, // 是否开始一个任务
    hasStart: true, // 是开始按钮?
    hasStop: false, // 是终止按钮?
    time: 1500, // 剩余时间
    formatTime: '25:00', // 格式化剩余时间
    totalTime: 1500, // 计时总时间
    start: false, // 是否开始计时
    timerAlert: false, // 是否计时器上的消息弹窗
    settingAlert: false, // 是否设置弹窗
    showCanvas: true, // 是否显示画布
    showHitMeTitle: true,
    hitMeNum: null,
  }
})