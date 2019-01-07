var app = getApp()
var request = require('../../utils/request')

Page({
  data: {
    creations: [],
    user: {},
    touches: {},
    lastId: '',
    catId: null,
    categoryName: '',
    qiniu: app.globalData.qiniu
  },

  setBarTitle: function(title) {
    wx.setNavigationBarTitle({
      title: title
    })
  },
  
  onLoad: function(options) {
    var that = this
    
    this.setData({
      catId: options.id
    })

    if (options.self) {
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
            that.getPins()
          }
        }
      })
    }
    else {
      this.getCreations()
    }
  },

  checkPin: function(id, idx) {
    var that = this
    var userData = app.globalData.userInfo

    request('pin', {
      data: {
        creationid: id,
        accessToken: userData.accessToken
      },
      success: function(res) {
        var data = res.data

        if (data.success) {
          var newCreations = that.data.creations.concat()

          if (!newCreations[idx].pined) {
            newCreations[idx].pined = true
          }
          else {
            newCreations[idx].pined = false
          }

          newCreations[idx].pined = data.data
        }

        that.setData({
          creations: newCreations
        })
      },
      
      fail: function() {

      }
    })
  },


  checkPinStatus: function(id, idx) {
    var that = this
    var user = app.globalData.userInfo

    if (user && user.accessToken) {
      this.checkPin(id, idx)
    }
    else {
      app.getUserInfo(function(err, userData) {
        if (err) {
          console.log(err)
        }

        if (userData && userData.accessToken) {
          that.checkPin(id, idx)
        }
      })
    }
  },

  touchstart: function(e) {
    var touch = e.touches[0]
    var pageX = touch.pageX
    var id = e.currentTarget.dataset.id
    var idx = e.currentTarget.dataset.idx
    var touches = this.data.touches

    touches[id] = {
      x: pageX,
      idx: idx
    }

    this.checkPinStatus(id, idx)
    this.setData({
      touches: touches
    })
  },

  touchmove: function(e) {
    var touch = e.touches[0]
    var pageX = touch.pageX
    var id = e.currentTarget.dataset.id
    var touches = this.data.touches
    var pos = {
      idx: touches[id].idx,
      x: touches[id].x,
      endX: pageX
    }

    touches[id] = pos

    this.setData({
      touches: touches
    })
  },

  touchend: function(e) {
    var id = e.currentTarget.dataset.id
    var url = e.currentTarget.dataset.url
    var touch = this.data.touches[id]
    var creations = this.data.creations.concat()
    var idx = this.data.touches[id].idx
    var animation = wx.createAnimation()

    if (touch && touch.x && touch.endX) {
      if ((touch.x - touch.endX) > 10) {
        animation.translate(-50).step()
        creations[idx].animation = animation.export()
        creations[idx].showLayer = true
      }
      else if ((touch.x - touch.endX) < -10) {
        animation.translate(0).step()
        creations[idx].animation = animation.export()
        creations[idx].showLayer = false
      }

      for (var k in this.data.touches) {
        var item = this.data.touches[k]
        if (id !== creations[item.idx]._id) {
          var newAnimation = wx.createAnimation()

          newAnimation.translate(0).step()
          creations[item.idx].animation = newAnimation
          creations[item.idx].showLayer = false
        }
      }
      
      this.setData({
        touches: this.data.touches,
        creations: creations
      })
    }
  },

  previewPhoto: function(e) {
    var that = this
    var idx = e.currentTarget.dataset.idx
    var url = e.currentTarget.dataset.url
    var creations = this.data.creations
    var currentCreations = []
    var urls = []

    if (idx + 1 < creations.length) {
      currentCreations = creations.slice(idx, idx + 7)
    }
    else {
      urls = [url]
    }

    currentCreations.forEach(function(item) {
      urls.push(that.data.qiniu.creation + item.qiniu_photo)
    })

    wx.previewImage({
      current: url,
      urls: urls
    })
  },

  reviewCreation: function(e) {
    var id = e.currentTarget.dataset.id
    var photo = e.currentTarget.dataset.photo

    wx.navigateTo({
      url: '../detail/index?id=' + id + '&photo=' + photo
    })
  },

  pinCreation: function(e) {
    var that = this
    var idx = e.currentTarget.dataset.idx
    var id = e.currentTarget.dataset.id
    var newCreations = this.data.creations.concat()
    var animation = wx.createAnimation()

    if (!newCreations[idx].pined) {
      newCreations[idx].pined = true
    }
    else {
      newCreations[idx].pined = false
    }

    this.setData({
      creations: newCreations
    })

    app.getUserInfo(function(err, userData) {
      if (err) {
        console.log(err)
      }

      if (userData && userData.accessToken) {
        request('pin', {
          data: {
            creationid: id,
            accessToken: userData.accessToken,
            pined: newCreations[idx].pined
          },
          method: 'POST',
          success: function(res) {
            animation.translate(0).step()
            newCreations[idx].animation = animation.export()
            newCreations[idx].showLayer = false

            that.setData({
              creations: newCreations
            })
          },
          
          fail: function() {

          }
        })  
      }
    })
  },

  getPins: function() {
    var that = this

    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 2000
    })

    request('pins', {
      data: {
        lastId: that.data.lastId || '',
        catId: that.data.catId,
        accessToken: that.data.user.accessToken
      },
      success: function(res) {
        var data = res.data
        
        if (data.success) {
          var creations = data.data.creations
          var categoryName = data.data.categoryName
          var len = creations.length
          var lastId = len ? creations[len - 1]._id : ''
          var newCreations = that.data.creations.concat(creations)

          that.setData({
            lastId: lastId,
            creations: newCreations,
            categoryName: categoryName
          })

          that.setBarTitle(categoryName)
        }
      },
      
      fail: function() {

      }
    })
  },

  getCreations: function() {
    var that = this

    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 2000
    })

    request('creations', {
      data: {
        lastId: that.data.lastId || '',
        catId: that.data.catId
      },
      success: function(res) {
        var data = res.data

        if (data.success) {
          var creations = data.data.creations
          var categoryName = data.data.categoryName
          var len = creations.length
          var lastId = len ? creations[len - 1]._id : ''
          var newCreations = that.data.creations.concat(creations)

          that.setData({
            lastId: lastId,
            creations: newCreations,
            categoryName: categoryName
          })

          that.setBarTitle(categoryName)
        }
      },
      
      fail: function() {

      }
    })
  }
})