// app.js
var request = require('./utils/request')

App({
  globalData: {
    userInfo: null,
    qiniu: {
      creation: 'https://oks58hvvf.qnssl.com/',
      avatar: 'https://oks6eftxx.qnssl.com/'
    }
  },

  onLaunch: function () {
    // 从本地缓存中获取数据
    var user = wx.getStorageSync('user') || {}

    if (user && user.accessToken) {
      this.globalData.userInfo = user
    }
  },

  setUserInfo: function(userInfo) {
    if (userInfo && userInfo.accessToken) {
      this.globalData.userInfo = userInfo
      wx.setStorageSync('user', userInfo)
    }
  },
  
  getUserInfo: function(cb) {
    var that = this
    var userInfo = this.globalData.userInfo

    // 首先获取并判断 app 里面的全局对象 globalData 里面是否已经缓存过用户数据
    if (userInfo && userInfo.accessToken) {
      typeof cb === 'function' && cb(null, userInfo)
      
      return
    }

    // 然后通过获取本地 localstorage 来判断是否存储过用户数据
    userInfo = wx.getStorageSync('user') || {}

    if (userInfo && userInfo.accessToken) {
      typeof cb === 'function' && cb(null, userInfo)

      return
    }

    // 最后，再次来调用登录接口
    wx.login({
      success: function(res) {
        if (res.code) {
          wx.getUserInfo({
            success: function(response) {
              request('signup', {
                method: 'POST',
                data: {
                  code: res.code,
                  user: response
                },
                success: function(_response) {
                  if (_response.data && _response.data.success) {
                    that.setUserInfo(_response.data.data)
                    typeof cb === 'function' && cb(null, _response.data.data)
                  }
                  else {
                    typeof cb === 'function' && cb(null, _response.data.err)
                  }
                },
                fail: function(res) {
                  typeof cb === 'function' && cb('服务器异常，稍后重试!')
                }
              })
            }
          })
        }
        else {
          typeof cb === 'function' && cb('获取用户登录态失败!' + res.errMsg)
        }

      },
      fail: function() {
        typeof cb === 'function' && cb('未获得授权登录')
      }
    })
  }
})