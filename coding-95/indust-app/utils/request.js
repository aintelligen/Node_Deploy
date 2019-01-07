var host = 'http://v3.wufazhuce.com:8000'
var api = require('./api')

var wxRequest = function(cat, params) {
  // wx.showToast({
  //   title: '加载中',
  //   icon: 'loading'
  // })

  var url = api[cat]

  wx.request({
    url: url,
    method: params.method || 'GET',
    data: params.data || {},
    header: {
      'Content-Type': 'application/json'
    },
    success: function(res) {
      params.success && params.success(res)
      wx.hideToast()
    },
    fail: function(res) {
      params.fail && params.fail(res)
    },
    complete: function(res) {
      params.complete && params.complete(res)
    }
  })
}

module.exports = wxRequest