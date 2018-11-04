// pages/todo/todo.js
const app = getApp()
const request = require('../../utils/request.js')
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    showTodoInput: false,
    addTodoText: '',
    addTodoDate: '点击这里选择',
    addTodoTime: '点击这里选择',
    iconPath: '../../assets/images/optionIcon.png',
    selectedIconPath: '../../assets/images/optionIcon-selected.png',
    todoAllData: [
      // {time: '10月14日', content: '哈哈哈', completed: false, iconPath: '../../assets/images/optionIcon.png', selectedIconPath: '../../assets/images/optionIcon-selected.png'},
      // {time: '10月14日', content: '哈哈哈', completed: false, iconPath: '../../assets/images/optionIcon.png', selectedIconPath: '../../assets/images/optionIcon-selected.png'},
      // {time: '10月14日', content: '哈哈哈', completed: true, iconPath: '../../assets/images/optionIcon.png', selectedIconPath: '../../assets/images/optionIcon-selected.png'},
      // {time: '10月14日', content: '哈哈哈', completed: true, iconPath: '../../assets/images/optionIcon.png', selectedIconPath: '../../assets/images/optionIcon-selected.png'},
    ],
    todoTodayData: [
      // {content: '哈哈哈', completed: false, iconPath: '../../assets/images/optionIcon.png', selectedIconPath: '../../assets/images/optionIcon-selected.png'},
      // {content: '哈哈哈', completed: false, iconPath: '../../assets/images/optionIcon.png', selectedIconPath: '../../assets/images/optionIcon-selected.png'},
      // {content: '哈哈哈', completed: true, iconPath: '../../assets/images/optionIcon.png', selectedIconPath: '../../assets/images/optionIcon-selected.png'},
      // {content: '哈哈哈', completed: true, iconPath: '../../assets/images/optionIcon.png', selectedIconPath: '../../assets/images/optionIcon-selected.png'}
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('233')
    this.getPageData()
  },
  getPageData: function () {
    request('GET', '/api/todo/getAllDealInfo')
      .then(res => { 
        this.setData({
          todoAllData: res.data.data
        })
      })

      request('GET', '/api/todo/getTodayDealInfo')
      .then(res => {
        console.log(res)
        this.setData({
          todoTodayData: res.data.data
        })
      })
  },
  todoSwiperChange: function (e) {
    // console.log(e)
    this.setData({
      currentTab: e.detail.current
    })
  },
  todoTabTap: function (e) {
    // console.log(e)
    if (this.data.currentTab === e.target.dataset.current) {
      return false
    } else {
      this.setData({
        currentTab: e.target.dataset.current
      })
    }
  }, 
  todoStateTap: function (e) {
    // 点击改变todo是否完成的状态
    let index = e.currentTarget.dataset.index
    if(this.data.currentTab === 0) {
      var todo_id = this.data.todoAllData[index].todoId
      var status = this.data.todoAllData[index].status === 0 ? 1: 0
    }
    if(this.data.currentTab === 1) {
      var todo_id = this.data.todoTodayData[index].todoId
      var status = this.data.todoTodayData[index].status === 0 ? 1: 0
    }
    
    request('POST', '/api/todo/changeStatus', {
      todo_id: todo_id,
      status: status
    })
    .then(res => {
      // console.log(res)
      this.getPageData()
    })
  },
  todoItemLongpress: function (e) {
    let that = this
    let index = e.currentTarget.dataset.index
    console.log(e)
    console.log(index)
    wx.showModal({
      title: '提示',
      content: '你确定要删除这个todo吗？',
      success (res) {
        if (res.confirm) {
          
          if(that.data.currentTab === 0) {
            console.log(index)
            console.log(that.data.todoAllData[index])
            var todo_id = that.data.todoAllData[index].todoId
          }
          if(that.data.currentTab === 1) {
            var todo_id = that.data.todoTodayData[index].todoId
          }
          request('GET', '/api/todo/deleteDealInfo', {
            todo_id: todo_id
          })
          .then(res => {
            if(res.data.code === 0) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500,
                success: function () {
                  that.getPageData()
                }
              })
            }
          })
        } else if (res.cancel) {

        }
      }
    })
    
  },
  addTodoBtnTap: function () {
    let that = this
    wx.hideTabBar({
      success: function () {
        that.setData({
          showTodoInput: true
        })
      }
    })
  },
  addTodoUnfold: function () {
    this.setData({
      showTodoInput: false,
      addTodoDate: '点击这里选择',
      addTodoTime: '点击这里选择'
    })
    wx.showTabBar()
  },
  addTodoInput: function (e) {
    // console.log(e.detail.value)
    this.setData({
      addTodoText: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      addTodoDate: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      addTodoTime: e.detail.value
    })
  },
  addTodoSendTap: function (e) {
    let do_time = this.data.addTodoDate + ' ' + this.data.addTodoTime
    if(typeof(do_time) !==  Number) {
      do_time = util.formatTime(new Date)
      // console.log('使用当前时间', do_time)
    }
    // console.log(typeof do_time)
    // console.log(do_time)
    request( 'POST','/api/todo/addDealInfo',{
      do_time: do_time,
      content: this.data.addTodoText
    })
    .then(res => {
      // console.log(res)
      let that = this
      if(res.data.code === 0) {
        this.addTodoUnfold()
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1500
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '发生错误，请稍后重试!',
          showCancel: false,
          success (res) {
            if (res.confirm) {
              that.addTodoUnfold()
            }
          }
        })
      }
      this.getPageData()
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