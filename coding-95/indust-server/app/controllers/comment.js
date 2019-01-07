'use strict'

var mongoose = require('mongoose')
var moment = require('moment')
var Comment = mongoose.model('Comment')
var Creation = mongoose.model('Creation')
var filter = require('../service/filter')


var userFields = [
  '_id',
  'avatar',
  'nickname'
]

exports.find = function *(next) {
  var id = this.query.creationid

  if (!id) {
    this.body = {
      success: false,
      err: '创意已经失效，获取不到评论内容了'
    }

    return next
  }

  var comments = yield Comment.find({
    creation: id
  })
  .populate('replyBy', userFields.join(' '))
  .sort({
    '_id': -1
  })
  .exec()

  this.body = {
    success: true,
    data: comments
  }
}

exports.save = function *(next) {
  var creationid = this.request.body.creationid
  var content = this.request.body.content || ''
  var user = this.session.user
  
  var creation = yield Creation.findOne({
    _id: creationid
  })
  .exec()

  if (!creation) {
    return (this.body = {
      success: false,
      err: '创意不见了'
    })
  }

  content = content.trim()

  if (!content) {
    return (this.body = {
      success: false,
      err: '评论不能为空哦！'
    })
  }

  if (filter.hasKeyword(content)) {
    return (this.body = {
      success: false,
      err: '评论中包含广告、色情、违禁、谣言等信息哦，请修改一下再提交！'
    })
  }

  var oldComments = yield Comment.find({
    creation: creation._id,
    replyBy: user._id
  })
  .sort({
    'meta.createAt': -1
  })
  .exec()

  var oldComment = oldComments[0]

  if (oldComments && oldComments[0]) {
    var oldComment = oldComments[0]
    var createAt = moment(oldComment.meta.createAt)
    var seconds = moment(new Date()).diff(createAt, 'seconds')

    if (seconds <= 20) {
      return (this.body = {
        success: false,
        err: '您评论的太频繁了，休息一下再来哦'
      })
    }
  }

  var comment = new Comment({
    creation: creation._id,
    replyBy: user._id,
    content: content
  })

  comment = yield comment.save()

  this.body = {
    success: true,
    data: [{
      _id: comment._id,
      meta: comment.meta,
      content: comment.content,
      replyBy: {
        _id: user._id,
        avatar: user.avatar,
        nickname: user.nickname
      }
    }]
  }
}


