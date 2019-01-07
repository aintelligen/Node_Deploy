'use strict'

var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
  phoneNumber: String,
  openid: {
    type: String,
    unique: true
  },
  areaCode: String,
  verifyCode: String,
  verified: {
    type: Boolean,
    default: false
  },
  accessToken: String,
  nickname: String,
  gender: Number,
  avatar: String,
  city: String,
  country: String,
  province: String,
  session_key: String,
  sessionExpires: Number,
  avatar_qiniu_key: String,
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


UserSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('User', UserSchema)
