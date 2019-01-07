'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

/**
 * Pin Schema
 */
var PinSchema = new Schema({
  user: {type: ObjectId, ref: 'User'},
  creation: {type: ObjectId, ref: 'Creation'},
  category: {type: ObjectId, ref: 'Category'},
  categoryName: String,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})


PinSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  }
  else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('Pin', PinSchema)
