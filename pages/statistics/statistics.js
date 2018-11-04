// pages/statistics/statistics.js
const request = require("../../utils/request.js")
const wxCharts = require("../../utils/wxcharts-min.js")
var todayChart = null
var lastWeekChart = null
Page({
  /**
   * 页面的初始数据
   */
  data: {
    todaySeries: [
      {
        name: "工作",
        data: 0,
        stroke: false,
        color: "#ee781f"
      },
      {
        name: "学习",
        data: 0,
        stroke: false,
        color: "#fabf1c"
      },
      {
        name: "思考",
        data: 0,
        stroke: false,
        color: "#2a71b9"
      },
      {
        name: "写作",
        data: 0,
        stroke: false,
        color: "#814b9b"
      },
      {
        name: "运动",
        data: 0,
        stroke: false,
        color: "#e4007f"
      },
      {
        name: "阅读",
        data: 0,
        stroke: false,
        color: "#63c0ab"
      }
    ],
    weekSeries: [
      {
        name: "最近一周",
        data: [],
        format: function(val, name) {
          return val.toFixed(2) + ""
        }
      }
    ],
    weekCategories: [],
    todayTotalTime: 0,
    weekTotalTime: 0,
    allTime: 0
  },

  // 绘制今日计时的图表
  drawTodayChart: function() {
    console.log("绘制今日计时图表")
    let todayChartWidth = 375
    try {
      let res = wx.getSystemInfoSync()
      let windowWidth = res.windowWidth
      todayChartWidth = windowWidth - 30
      // console.log(windowWidth)
    } catch (e) {
      console.error("getSystemInfoSync failed!")
    }

    todayChart = new wxCharts({
      animation: true,
      canvasId: "todayChart",
      type: "ring",
      extra: {
        ringWidth: 15,
        pie: {
          offsetAngle: -45
        }
      },
      title: {
        name: "",
        color: "#",
        fontSize: 25
      },
      subtitle: {
        name: "",
        color: "",
        fontSize: 15
      },
      series: this.data.todaySeries,
      disablePieStroke: true,
      width: todayChartWidth,
      height: 175,
      dataLabel: false,
      legend: true,
      background: "#3b525a"
    })
    todayChart.addEventListener("renderComplete", () => {
      console.log("renderComplete")
    })
    setTimeout(() => {
      todayChart.stopAnimation()
    }, 500)
  },

  // 绘制最近一周的图表
  drawLastWeekChart: function() {
    console.log("绘制最近一周的图表")
    let weekChartWidth = 360
    try {
      let res = wx.getSystemInfoSync()
      let windowWidth = res.windowWidth
      weekChartWidth = windowWidth - 15
    } catch (e) {
      console.error("getSystemInfoSync failed!")
    }

    let weekCategories = this.data.weekCategories
    let weekSeries = this.data.weekSeries
    console.log(weekCategories)
    console.log(weekSeries)
    lastWeekChart = new wxCharts({
      canvasId: "lastWeekChart",
      type: "line",
      categories: weekCategories,
      animation: true,
      background: "#3b525a",
      series: weekSeries,
      xAxis: {
        disableGrid: true,
        fontColor: "#eee"
      },
      yAxis: {
        title: "",
        format: function(val) {
          return val.toFixed(2)
        },
        min: 0,
        fontColor: "#eee"
      },
      width: weekChartWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: "curve"
      }
    })
  },
  weekChartTouchHandler: function (e) {
    lastWeekChart.showToolTip(e, {
      format: function (item, category) {
          return category + ' ' + '完成了' +  item.data + '分钟'
      }
  });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log("加载页面数据")
    let that = this
    let todaySeries = this.data.todaySeries
    request("GET", "/api/count/countTodayTimeInfo")
      .then(res => {
        console.log("今日计时信息", res)
        let data = res.data.data
        let todayTotalTime = 0 // 今日计时总时间
        data.forEach(item => {
          let value = item.interval
          let index = item.label
          todayTotalTime = todayTotalTime + value
          if (todaySeries[index].data === null) {
            todaySeries[index].data = value
          } else {
            todaySeries[index].data += value
          }
        })
        this.setData({
          todaySeries: todaySeries,
          todayTotalTime: todayTotalTime
        }, function () {
          that.drawTodayChart() // 绘制今日计时统计图表
        })
        return request("GET", "/api/count/countWeekTimeInfo")
      })
      .then(res => {
        console.log("最近一周计时信息", res)
        let data = res.data.data
        let weekCategories = []
        let weekSeriesData = []
        let weekTotalTime = 0
        data.forEach(item => {
          weekTotalTime = weekTotalTime + item.totalTime
          weekCategories.push(item.date)
          weekSeriesData.push(item.totalTime)
        })
        let weekSeriesDataStr = "weekSeries[0].data"
        this.setData({
          weekCategories: weekCategories,
          [weekSeriesDataStr]: weekSeriesData,
          weekTotalTime: weekTotalTime
        }, function () {
          that.drawLastWeekChart()
        })
        return request('GET', '/api/count/countAllTimeInfo')
      })
      .then(res => {
        let allTime = res.data.data[0].allTime || 0
        this.setData({
          allTime: allTime
        })
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
})
