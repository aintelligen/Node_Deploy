//index.js
//获取应用实例
var app = getApp()

var request = require('../../utils/request')

Page({
  data: {
    ads: [],                
    categories: [],         
    indicatorDots: false,    
    autoplay: false,        
    interval: 3000,         
    duration: 1200,         
    logined: false,        
    lastId: 0,        
    user: {},
    qiniu: app.globalData.qiniu,
    totalNumbers: 20
  },

  onLoad: function () {
    var that = this
    
    app.getUserInfo(function(err, userData) {
      if (err) {
        console.log(err)
      }
      else {
        that.setData({
          logined: true,
          user: userData
        })
        if (userData && userData.accessToken) {
          that.getCategories()
        }
      }
    })
  },

  getCategories: function() {
    var that = this

    wx.showToast({
      title: '正在加载中',
      icon: 'loading',
      duration: 2000
    })

    request('pins', {
      data: {
        accessToken: this.data.user.accessToken
      },
      success: function(res) {
        var data = res.data

        if (data.success) {
          that.setData({
            categories: data.data
          })
        }
      },
      
      fail: function() {

      }
    })
  }
})
