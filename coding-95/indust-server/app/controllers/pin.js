'use strict'

var _ = require('lodash')
var mongoose = require('mongoose')
var Promise = require('bluebird')
var Creation = mongoose.model('Creation')
var Pin = mongoose.model('Pin')
var Category = mongoose.model('Category')
var xss = require('xss')
var config = require('../../config/config')


exports.check = function *(next) {
  var user = this.session.user
  var creationid = this.query.creationid

  var pin = yield Pin.findOne({
    user: user._id,
    creation: creationid
  }).exec()

  this.body = {
    success: 1,
    data: !!pin
  }
}

// http://blog.csdn.net/zhangzhebjut/article/details/16848045
// Upgrade to MongoDB v3.2+
// https://github.com/Automattic/mongoose/issues/3682
// https://eclipsesv.com/2016/11/23/mongodb_Aggregation/
exports.find = function *(next) {
  var user = this.session.user
  var lastId = this.query.lastId
  var categoryId = this.query.catId
  var pins

  if (categoryId) {
    var query = {
      user: user._id,
      category: categoryId
    }
    var creation
    var creationid

    if (lastId) {
      creation = yield Creation.findOne({
        _id: lastId
      })
      .exec()

      if (creation) {
        creationid = creation.creationid
        query.creationid = {$gt: creationid}
      }
    }

    var data = yield [
      Pin.find(query)
        .select('_id creation categoryName')
        .populate({
          path: 'creation',
          match: {
            success: {$gt: 1}
          },
          select: 'qiniu_thumb qiniu_photo success',
          options: {
            limit: 20
          }
        })
        .sort({'creation.creationid': 1})
        .limit(20)
        .exec(),
      Category.findOne({_id: categoryId}).exec()
    ]

    var creations = data[0] || []
    var categoryName = data[1].categoryName || ''

    pins = []

    creations.forEach(function(item) {
      if (item.creation && item.creation._id && item.creation.success > 1) {
        pins.push(item.creation)
      }
    })

    this.body = {
      success: true,
      data: {
        creations: pins,
        categoryName: categoryName
      }
    }
  }
  else {
    pins = yield Pin.aggregate([
      {
        $match: {
          user: user._id
        }
      },
      {
        $project: {
          _id: 1,
          user: 1,
          categoryName: 1,
          category: 1,
          creation: 1
        }
      },
      {
        $lookup: {
          from: 'creations',
          localField: 'creation',
          foreignField: '_id',
          as: 'creation'
        }
      },
      {
        $group: {
          _id: '$category',
          creations: {$push: '$creation.qiniu_thumb'},
          categoryName: {$first: '$categoryName'},
          count: {$sum: 1}
        }
      },
    ]).exec()

    this.body = {
      success: true,
      data: pins
    }
  }
}

var userFields = [
  'avatar',
  'nickname'
]


exports.add = function *(next) {
  var body = this.request.body
  var creation = yield Creation.findOne({
    _id: body.creationid
  })
  .exec()

  if (!creation || !creation._id) {
    return (this.body = {
      success: false,
      err: '案例图已经失效或已被移除'
    })
  }

  var user = this.session.user
  var pin = yield Pin.findOne({
    user: user._id,
    creation: creation._id
  }).exec()

  if (!body.pined && pin) {
    yield pin.remove()
  }
  else {
    pin = new Pin({
      user: user._id,
      creation: creation._id,
      category: creation.category,
      categoryName: creation.categoryName
    })

    pin = yield pin.save()
  }

  var count = yield Pin.count({
    creation: creation._id
  }).exec()

  this.body = {
    success: 1,
    count: count
  }
}

