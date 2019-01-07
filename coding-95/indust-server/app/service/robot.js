'use strict'

var qiniu = require('qiniu')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var config = require('../../config/config')

qiniu.conf.ACCESS_KEY = config.qiniu.AK
qiniu.conf.SECRET_KEY = config.qiniu.SK

exports.saveToQiniu = function(url, key, type) {
  var client = new qiniu.rs.Client()
  var bucket = 'industcreation'
  
  if (type === 'avatar') {
    bucket = 'industavatar'
  }

  return new Promise(function(resolve, reject) {
    client.fetch(url, bucket, key, function(err, ret) {
      if (!err) {
        resolve(ret)
      }
      else {
        reject(err)
      }
    })
  })
}

exports.getSessionKey = function(code) {
  // https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code

  var url = [
    config.wechat.base,
    '?appid=',
    config.wechat.appid,
    '&secret=',
    config.wechat.secret,
    '&js_code=',
    code,
    '&grant_type=authorization_code'
  ].join('')

  return new Promise(function(resolve, reject) {
    request({url: url, json: true}).then(function(response) {
      var data = response.body

      resolve(data)
    })
  })
}

