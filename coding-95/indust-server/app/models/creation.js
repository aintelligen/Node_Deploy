'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed
var autoIncrement = require('mongoose-sequence')

var CreationSchema = new Schema({
  title: String,

  category: {type: ObjectId, ref: 'Category'},
  categoryName: String,

  houzz_url: {
    type: String,
    unique: true
  },

  houzz_photo: String,
  houzz_thumb: String,

  qiniu_thumb: String,
  qiniu_photo: String,

  votes: [String],

  // 0 爬过来 houzz_url
  // 1 存储好 houzz_photo 和 houzz_thumb
  // 2 存储好 qiniu_photo 和 qiniu_thumb
  success: {
    type: Number,
    default: 0
  },

  up: {
    type: Number,
    default: 0
  },

  meta: {
    createAt: {
      type: Date,
      dafault: Date.now()
    },
    updateAt: {
      type: Date,
      dafault: Date.now()
    }
  }
})

CreationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

CreationSchema.plugin(autoIncrement, {inc_field: 'creationid'})

module.exports = mongoose.model('Creation', CreationSchema)
