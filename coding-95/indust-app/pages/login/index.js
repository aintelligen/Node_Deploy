var app = getApp()

Page({
  data: {
  },

  data: {
    array: ['中国', '新加坡', '日本', '香港', '韩国', '台湾', '澳门'],
    arrayNum: ['86', '65', '81', '852', '82', '886', '853'],
    index: 0,
    mobile: 0
  },

  onPullDownRefresh: function() {
    wx.stopPullDownRefresh()
  },

  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },

  bindMobileInput: function(e) {
    this.setData({
      mobile: e.detail.value
    })
  },

  getVerifyCode: function() {
    var that = this

    request('signup', {
      data: {
        area: parseInt(this.data.arrayNum[this.data.index]),
        mobile: parseInt(this.data.mobile)
      },
      method: 'POST',
      success: function(res) {
        if (data.success) {
          that.setData({
            user: data.data
          })
        }
      },
      
      fail: function() {

      }
    })
  },

  verify: function() {
    var that = this

    request('login', {
      area: parseInt(this.data.arrayNum[this.data.index]),
      mobile: parseInt(this.data.mobile),
      type: 'verify'
    })
    .then(function(res) {
      console.log(res)
    })
  },

  formSubmit: function(e) {
    console.log(e.detail.value)
  }
})
