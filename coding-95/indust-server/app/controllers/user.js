'use strict'

var xss = require('xss')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var uuid = require('uuid')
var config = require('../../config/config')
var sms = require('../service/sms')
var robot = require('../service/robot')
var Encrypt = require('../service/encrypt')


function pickup(user) {
  var newUser = {}
  var fields = [
    'avatar',
    'accessToken',
    'gender',
    'avatar',
    'nickname'
  ]

  fields.forEach(function(item) {
    newUser[item] = user[item]
  })

  return newUser
} 

exports.signup = function *(next) {
  var body = this.request.body
  var code = body.code
  var userData = body.user
  var encryptedData = userData.encryptedData
  var userInfo = userData.userInfo
  var iv = userData.iv
  var data

  try {
    data = yield robot.getSessionKey(code)
  }
  catch (e) {
    console.log(e)

    return (this.body = {
      success: false,
      err: '与微信通信失败，请稍后重试'
    })
  }


  if (data.errcode) {
    console.log(data)

    return (this.body = {
      success: false,
      err: '不合法的 code，请退出小程序重新进入'
    })
  }


  var sessionKey

  if (data.session_key) {
    sessionKey = data.session_key
  }

  var pc = new Encrypt(config.wechat.appid, sessionKey)
  
  var newData = pc.decryptData(encryptedData , iv)
    
  console.log(newData)

  // {
  //   openId: 'o8jj70P4FnK-2q-XFwFKSX1BHmgM',
  //   nickName: '董必正@Moveha|CampusRoom',
  //   gender: 1,
  //   language: 'en',
  //   city: 'Hangzhou',
  //   province: 'Zhejiang',
  //   country: 'CN',
  //   avatarUrl: 'http://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJEbHOKGP7sZ7Io76b0UFUMF05yx7yXyA6LPdOHqrU1bwgvCwicBOL50q0WasB4OJNyJH3zk3OFQhA/0',
  //   watermark: {
  //     timestamp: 1487907429,
  //     appid: 'wxd53a9074066cd417'
  //   }
  // }

  var openid = newData.openId
  var user = yield User.findOne({
    openid: openid
  }).exec()

  // 24 小时候过期
  var now = (new Date().getTime())
  var expires = 24 * 3600 * 1000

  if (user) {
    // if (user.sessionExpires <= now) {
    //   return (this.body = {
    //     success: false,
    //     err: '回话已经过期，请重新登录'
    //   })
    // }
    // else {
    user.sessionExpires = now + expires
    user = yield user.save()

    return (this.body = {
      success: true,
      data: pickup(user)
    })
    //}
  }

  var accessToken = uuid.v4()
  var nickName = newData.nickName
  var avatarUrl = newData.avatarUrl
  // 性别 0：未知、1：男、2：女 
  var gender = newData.gender
  var province = newData.province || ''
  var city = newData.city || ''
  var country = newData.country || ''

  var userMap = {
    openid: openid,
    phoneNumber: openid,
    nickname: nickName,
    gender: gender,
    province: province,
    city: city,
    country: country,
    avatar: avatarUrl,
    accessToken: accessToken,
    session_key: sessionKey,
    sessionExpires: now + expires
  }
  
  user = new User(userMap)

  user = yield user.save()

  this.body = {
    success: true,
    data: pickup(user)
  }
}

exports.verify = function *(next) {
  var verifyCode = this.request.body.verifyCode
  var phoneNumber = this.request.body.phoneNumber

  if (!verifyCode || !phoneNumber) {
    this.body = {
      success: false,
      err: '验证没通过'
    }

    return next
  }

  var user = yield User.findOne({
    phoneNumber: phoneNumber,
    verifyCode: verifyCode
  }).exec()

  if (user) {
    user.verified = true
    user = yield user.save()

    this.body = {
      success: true,
      data: {
        nickname: user.nickname,
        accessToken: user.accessToken,
        avatar: user.avatar,
        _id: user._id
      }
    }
  }
  else {
    this.body = {
      success: false,
      err: '验证未通过'
    }
  }
}


