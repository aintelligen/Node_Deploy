//index.js
//获取应用实例
var app = getApp()

var request = require('../../utils/request')

Page({
  data: {
    ads: [],                //照片墙
    categories: [],         //照片墙
    indicatorDots: false,   //是否显示面板指示点
    autoplay: false,        //是否自动播放
    interval: 3000,         //自动切换时间间隔
    duration: 1200,         //滑动动画时长
    storieslist: [],        //首页故事列表
    lastId: 0,              //当前页
    qiniu: app.globalData.qiniu,
    totalNumbers: 20        //首页新闻条数
  },

  onLoad: function () {
    var that = this
    
    this._getCategories()
  },

  _getCategories: function() {
    var that = this

    wx.showToast({
      title: '正在加载中',
      icon: 'loading',
      duration: 2000
    })

    request('categories', {
      data: {},
      success: function(res) {
        var data = res.data

        if (data.success) {
          that.setData({
            categories: data.data,
            ads: data.ads
          })
        }
      },
      
      fail: function() {

      }
    })
  }
})
