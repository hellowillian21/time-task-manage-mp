// pages/timer/timer.js
const app = getApp()
const request = require('../../utils/request.js')
const util = require('../../utils/util.js')
let timer
Page({
  /**
   * 页面的初始数据
   */
  data: {
    taskOptions: [
      {id: 0, name: '工作', checked: false, iconPath: '../../assets/images/work.png', selectedIconPath: '../../assets/images/work-selected.png'},
      {id: 1,name: '学习', checked: false, iconPath: '../../assets/images/study.png', selectedIconPath: '../../assets/images/study-selected.png'},
      {id: 2,name: '思考', checked: false, iconPath: '../../assets/images/think.png', selectedIconPath: '../../assets/images/think-selected.png'},
      {id: 3,name: '写作', checked: false, iconPath: '../../assets/images/write.png', selectedIconPath: '../../assets/images/write-selected.png'},
      {id: 4,name: '运动', checked: false, iconPath: '../../assets/images/sport.png', selectedIconPath: '../../assets/images/sport-selected.png'},
      {id: 5,name: '阅读', checked: false, iconPath: '../../assets/images/read.png', selectedIconPath: '../../assets/images/read-selected.png'},
    ],
    taskId: null,
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
    repeatOptions: [  // 重复 单项选择的数组
      {name: '0', value: '不重复', disabled: false, checked: true},
      {name: '1', value: '一次', disabled: true},
      {name: '2', value: '两次', disabled: true},
      {name: '3', value: '三次', disabled: true},
      {name: '4', value: '四次', disabled: true},
      {name: '5', value: '五次', disabled: true}
    ],
    repeat: 0, // 选择重复计时次数
    tempTotalTime: 1500, // 临时计时总时间
    tempTime: 1500, // 临时剩余时间
    tempRepeat: 0, // 临时重复计时次数

  },
    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.initDrawCircle()
  },
  chooseTaskTap: function (options) {
    const index = options.currentTarget.dataset.index
    const len = this.data.taskOptions.length
    for (let i = 0; i < len; i++) {
      let checked = "taskOptions[" + i + "].checked"
      if (i === index) {
        console.log('哈哈', index, i)
        this.setData({
          [checked]: true,
          taskId: index
        })
      } else {
        console.log(checked)
        this.setData({
          [checked]: false
        })
      }
    }

  },
  // 绘制灰色背景圆圈
  grayCircle: function () {
    let contextBg = wx.createCanvasContext('timer-progress-bg')
    let centerX = (this.windowWidth * 2 / 750) * 500 / 4// canvas中心点x的坐标
    let centerY = (this.windowWidth * 2 / 750) * 500 / 4// canvas中心点y的坐标
    let radius = (this.windowWidth * 2 / 750) *100

    contextBg.setStrokeStyle("#a6a6a6") // 设置描边样式
    contextBg.setLineWidth(2) // 设置线宽
    contextBg.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
    contextBg.stroke() //绘制
    contextBg.restore()
    contextBg.draw()
  },

  // 绘制7像素蓝绿色运动外圈
  greenCircle: function (n) {
    let context = wx.createCanvasContext('timer-progress-canvas')
    let centerX = (this.windowWidth * 2 / 750) * 500 / 4// canvas中心点x的坐标
    let centerY = (this.windowWidth * 2 / 750) * 500 / 4// canvas中心点y的坐标
    let radius = (this.windowWidth * 2 / 750) *100
    // let centerX = 125// canvas中心点x的坐标
    // let centerY = 125// canvas中心点y的坐标
    // let radius = 100
    let rad = Math.PI*2/360// 将360度分成100份，那么每一份就是rad度
    // console.log(centerX,centerY)
    let speed = 0.2// 加载的快慢就靠它了
    // context.save()
    context.setStrokeStyle("#20b2aa") // 设置描边样式
    context.setLineWidth(7) // 设置线宽
    // context.beginPath() //路径开始
    context.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + n * rad, false)
    context.stroke() //绘制
    // context.closePath() // 路径结束
    context.restore()
    context.draw()
  },

  // 初始化一个计时圆圈
  initDrawCircle: function () {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.windowWidth = res.windowWidth
        that.windowHeight = res.windowHeight
        console.log(that.windowWidth, that.windowHeight)
        that.grayCircle()
        that.greenCircle(360)
      }
    })
  },
  // 开启一个任务计时
  openTaskTap: function (e) {
    if (this.data.taskId === null) {
      wx.showToast({
        title: '请选择一个任务',
        icon: 'none',
        mask: true,
        duration: 1000
      })
      return false
    }
    this.setData({
      startTask: true
    })
  },

  // 倒计时计时器
  timer: function () {
    const backgroundAudioManager = wx.getBackgroundAudioManager()
    let dateTime = util.formatTime(new Date())
    let totalTime = this.data.totalTime
    let time = this.data.time
    let formatTime = this.data.formatTime
    
    timer = setInterval(() => {
      time = time -1
      let n = 360 / totalTime * time
      formatTime = Math.floor(time/60)+":"+(time%60/100).toFixed(2).slice(-2)
      if (this.data.time === 0) {
        console.log('time0')
        clearInterval(timer)
        this.timerCompleted()
        backgroundAudioManager.src = 'http://music.163.com/song/media/outer/url?id=482673530.mp3'
        wx.showModal({
          title: '提示',
          content: '完成任务啦~',
          showCancel: false,
          success (res) {
            if (res.confirm) {
              backgroundAudioManager.stop()
            }
          }

        })
      }
      this.greenCircle(n)
      this.setData({
        time: time,
        formatTime: formatTime,
        start: true,
        startDateTime: dateTime
      })
    },1000)
    console.log(timer)
    return timer
  },
  // 开始计时
  startTap: function (e) {
    console.log('start')
    this.timer()
    this.setData({
      hasStart: false,
      hasStop: true
    })
  },
  stopTap: function () {
    this.setData({
      timerAlert: true
    })
  },
  hitMeTap: function() {
    if(this.data.start) {
      console.log(1111)
      let hitMeNum = this.data.hitMeNum + 1
      this.setData({
        hitMeNum: hitMeNum,
        showHitMeTitle: false
      })
    }
  },
  // 取消弹窗继续计时
  timerAlertCancelTap: function () {
    this.setData({
      timerAlert: false
    })
  },
  // 放弃计时
  timerAlertGiveupTap: function () {
    console.log('放弃计时',timer)
    clearInterval(timer)
    this.initDrawCircle()
    this.setData({
      startTask: app.globalData.startTask, 
      hasStart: app.globalData.hasStart,
      hasStop: app.globalData.hasStop,
      time: app.globalData.time,
      formatTime: app.globalData.formatTime,
      totalTime: app.globalData.totalTime,
      start: app.globalData.start,
      timerAlert: app.globalData.timerAlert,
      settingAlert: app.globalData.settingAlert,
      showCanvas: app.globalData.showCanvas,
      showHitMeTitle: app.globalData.showHitMeTitle,
      hitMeNum: app.globalData.hitMeNum,
    })
  },
  // 完成计时
  timerCompleted: function () {
    let startDateTime = this.data.startDateTime
    let label = this.data.taskId
    console.log(typeof label)
    let time = Math.round(this.data.totalTime/60) - Math.round(this.data.time/60)
    // 四舍五入如果小于一分钟不给予提前完成
    if (time < 1) {
      wx.showToast({
        title: '过早完成!',
        icon: 'none',
        mask: true,
        duration: 1000
      })
      return false
    }
    clearInterval(timer)
    this.initDrawCircle()
    
    request('POST', '/api/time/addTimeInfo', {
      create_time: startDateTime,
      interval: time,
      label: label
    })
    .then(res => {
      console.log(res)
      this.setData({
        startTask: app.globalData.startTask, 
        hasStart: app.globalData.hasStart,
        hasStop: app.globalData.hasStop,
        time: app.globalData.time,
        formatTime: app.globalData.formatTime,
        totalTime: app.globalData.totalTime,
        start: app.globalData.start,
        timerAlert: app.globalData.timerAlert,
        settingAlert: app.globalData.settingAlert,
        showCanvas: app.globalData.showCanvas,
        showHitMeTitle: app.globalData.showHitMeTitle,
        hitMeNum: app.globalData.hitMeNum,
      })
    })

  },
  // 左边设置按钮
  settingLeftBtnTap: function () {
    wx.showToast({
      title: '暂未开放',
      icon: 'none'
    })
  },
  // 右边设置按钮
  settingRightBtnTap: function () {
    if (!this.data.start) {
      this.setData({
        settingAlert: true,
        showCanvas: false
      })
    } else {
      wx.showToast({
        title: '正在计时',
        icon: 'none'
      })
    }
  },
  // 设置弹窗的取消按钮点击事件
  settingAlertCancelTap: function () {
    this.setData({
      settingAlert: false,
      showCanvas: true
    })
  },
  // 设置计时时长
  totalTimeChange: function (e) {
    console.log(e.detail.value)
    let tempTotalTime = e.detail.value * 60
    let tempTime = e.detail.value * 60
    let tempFormatTime = Math.floor(tempTime/60)+":"+(tempTime%60/100).toFixed(2).slice(-2)
    this.setData({
      tempTotalTime: tempTotalTime,
      tempTime: tempTime,
      tempFormatTime: tempFormatTime
    })
  },
  // 设置重复
  repeatChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      tempRepeat: e.detail.value
    })
  },
  // 设置弹窗确认设置按钮
  settingAlertSetTap: function () {
    this.setData({
      totalTime: this.data.tempTotalTime,
      time: this.data.tempTime,
      repeat: this.data.tempRepeat,
      formatTime: this.data.tempFormatTime,
      settingAlert: false,
      showCanvas: true
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.login()

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})