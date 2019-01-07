'use strict'

var _ = require('lodash')
var mongoose = require('mongoose')
var Promise = require('bluebird')
var Creation = mongoose.model('Creation')
var Pin = mongoose.model('Pin')
var Category = mongoose.model('Category')
var User = mongoose.model('User')
var xss = require('xss')
var robot = require('../service/robot')
var config = require('../../config/config')

var userFields = [
  'avatar',
  'nickname'
]

exports.categories = function *(next) {
  var categories = yield Category
    .find({})
    .select('categoryName creations _id')
    .populate({
      path: 'creations',
      match: {
        success: {$gt: 1}
      },
      select: 'qiniu_thumb success',
      options: {
        limit: 12
      }
    })
    .exec()

  this.body = {
    success: 1,
    data: categories
  }
}

exports.detail = function *(next) {
  var creationid = this.query.creationid
  
  if (!creationid && creationid == 'undefined') {
    return (this.body = {
      success: false,
      err: '创意 ID 不合法'
    })
  }

  var creation = yield Creation.findOne({
    _id: creationid
  }).exec()

  if (!creation) {
    return (this.body = {
      success: false,
      err: '创意已经失效'
    })
  }

  var pin
  var count
  var accessToken = this.query.accessToken
  var query = {
    creation: creation._id
  }

  if (accessToken) {
    var user = yield User.findOne({
      accessToken: accessToken
    }).exec()

    if (user) {
      query.user = user._id
      pin = yield Pin.findOne(query).exec()
      count = yield Pin.count({creation: creationid}).exec()
    }
  }

  return (this.body = {
    success: true,
    data: creation,
    pined: !!pin,
    count: count
  })
}

exports.find = function *(next) {
  var lastId = this.query.lastId
  var categoryId = this.query.catId
  var query = {
    category: categoryId,
    success: {$gt: 0}
  }
  var creation
  var creationid

  if (lastId) {
    creation = yield Creation.findOne({
      _id: lastId
    })
    .exec()
  }

  if (creation) {
    creationid = creation.creationid
    query.creationid = {$gt: creationid}
  }

  var data = yield [
    Creation.find(query)
    .select('qiniu_photo qiniu_thumb')
    .sort({creationid: 1})
    .limit(20)
    .exec(),
    Category.findOne({_id: categoryId}).exec()
  ]

  var creations = data[0] || []
  var categoryName = data[1].categoryName || ''

  this.body = {
    success: true,
    data: {
      creations: creations,
      categoryName: categoryName
    }
  }
}





