'use strict'

var Router = require('koa-router')
var User = require('../app/controllers/user')
var App = require('../app/controllers/app')
var Creation = require('../app/controllers/creation')
var Comment = require('../app/controllers/comment')
var Houzz = require('../app/controllers/houzz')
var Pin = require('../app/controllers/pin')

module.exports = function() {
  var router = new Router({
    prefix: '/api'
  })

  // user
  router.post('/u/signup', App.hasBody, User.signup)
  router.post('/u/verify', App.hasBody, User.verify)

  // creations
  router.get('/categories', Creation.categories)
  router.get('/creations', Creation.find)
  router.get('/creation', Creation.detail)

  // pins
  router.get('/pin', App.hasToken, Pin.check)
  router.post('/pin', App.hasToken, Pin.add)
  router.get('/pins', App.hasToken, Pin.find)

  // comments
  router.get('/comments', Comment.find)
  router.post('/comments', App.hasBody, App.hasToken, Comment.save)

  return router
}
