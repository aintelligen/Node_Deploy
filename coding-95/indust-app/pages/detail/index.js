//index.js
//获取应用实例
var app = getApp()

var request = require('../../utils/request')

Page({
  data: {
    qiniu: app.globalData.qiniu,
    totalFavourites: 0,
    pined: false,
    submiting: false,
    content: '',
    qiniu_photo: '',
    willPop: false,
    focused: false,
    pinCount: 0,
    animation: wx.createAnimation(),
    comments: [],
    creation: {}
  },

  commentFocus: function(e) {
    this.setData({
      focused: true
    })
  },

  commentBlur: function(e) {
    this.setData({
      focused: false
    })
  },

  countWords: function(str) {
    var maxLen = 200
    var myLen = this.getLen(str)

    if (myLen > maxLen * 2) {
      wx.showModal({
        showCancel: false,
        title: '字数超出',
        content: '字数太多了，编辑后重新提交'
      })

      return false
    }

    return true
  },

  willComment: function(e) {
    var animation = wx.createAnimation()

    animation.top(200).step()
    
    this.setData({
      willPop: true,
      animation: animation.export()
    })
  },


  getLen: function(str) {
    var maxLen = 200
    var myLen = 0

    for (var i = 0; (i < str.length) && (myLen <= maxLen * 2); i++) {
      if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128)
        myLen++
      else {
        myLen += 2
      }
    }

    return myLen
  },

  setBarTitle: function(title) {
    if (!this.data.categoryName) {
      wx.setNavigationBarTitle({
        title: title
      })
    }
  },

  onLoad: function(options) {
    var that = this
    
    this.setData({
      qiniu_photo: options.photo,
      creationid: options.id
    })

    this.getCreation()
  },


  getCreation: function() {
    var that = this
    var user = app.globalData.userInfo

    if (user && user.accessToken) {
      this.getCreationDetail()
    }
    else {
      app.getUserInfo(function(err, userData) {
        if (err) {
          console.log(err)
        }

        if (userData && userData.accessToken) {
          that.getCreationDetail()
        }
      })
    }
  },


  pinCreation: function(e) {
    var that = this
    var id = e.currentTarget.dataset.id

    app.getUserInfo(function(err, userData) {
      if (err) {
        console.log(err)
      }
      
      if (userData && userData.accessToken) {
        request('pin', {
          data: {
            creationid: id,
            accessToken: userData.accessToken,
            pined: !that.data.pined
          },
          method: 'POST',
          success: function(res) {
            that.setData({
              pinCount: res.data.count,
              pined: !that.data.pined
            })
          },
          
          fail: function() {

          }
        }) 
      }
    })
  },

  getCreationDetail: function() {
    var that = this
    var user = app.globalData.userInfo

    request('creation', {
      data: {
        accessToken: user.accessToken,
        creationid: this.data.creationid
      },
      success: function(res) {
        var data = res.data

        if (data.success) {
          that.setData({
            creation: data.data,
            pined: data.pined,
            pinCount: data.count
          })

          that.setBarTitle(data.data.categoryName)
          that._getComments()
        }
      },
      
      fail: function() {

      }
    })
  },

  _getComments: function() {
    var that = this

    request('comments', {
      data: {
        creationid: this.data.creationid
      },
      success: function(res) {
        var data = res.data

        if (data.success) {
          that.setData({
            comments: data.data
          })
        }
      },
      
      fail: function() {

      }
    })
  },

  previewPhoto: function(e) {
    var that = this
    var url = e.currentTarget.dataset.url

    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  formSubmit: function(e) {
    var formData = e.detail.value
    var content = formData.content

    if (!content) {
      wx.showModal({
        showCancel: false,
        title: '不好意思，出错了',
        content: '评论不能为空哦！'
      })

      return
    }

    var that = this
    var user = app.globalData.userInfo

    if (user && user.accessToken) {
      this.comment(content)
    }
    else {
      app.getUserInfo(function(err, userData) {
        if (err) {
          console.log(err)
        }

        if (userData && userData.accessToken) {
          that.comment(content)
        }
      })
    }
  },

  leaveComment: function(e) {
    var animation = wx.createAnimation()

    animation.top(-1000).step()
    
    this.setData({
      willPop: false,
      animation: animation.export()
    })
  },

  comment: function(content) {
    var that = this
    var userData = app.globalData.userInfo

    if (!this.countWords(content)) {
      return
    }

    this.setData({
      submiting: true
    })

    request('comments', {
      data: {
        accessToken: userData.accessToken,
        creationid: this.data.creationid,
        content: content
      },
      method: 'POST',
      success: function(res) {
        var data = res.data

        if (data.success) {
          var comments = that.data.comments.concat()
          var newComments = data.data.concat(comments)
          var animation = wx.createAnimation()

          animation.top(-1000).step()
          
          that.setData({
            animation: animation.export(),
            focused: false,
            content: '',
            willPop: false,
            submiting: false,
            comments: newComments
          })
        }
        else {
          if (data.err) {
            that.setData({
              submiting: false,
              focused: true
            })

            wx.showModal({
              showCancel: false,
              submiting: false,
              title: '不好意思，出错了',
              content: data.err
            })
          }
        }
      },
      
      fail: function() {
        wx.showModal({
          showCancel: false,
          submiting: false,
          title: '不好意思，出错了',
          content: '评论失败，请稍后再试'
        })
      }
    })
  }
})
