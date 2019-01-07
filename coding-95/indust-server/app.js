'use strict'

var fs = require('fs')
var path = require('path')
var mongoose = require('mongoose')
var env = process.env.NODE_ENV || 'development'
var dbUrl = 'mongodb://indust_app_runner:Fa*e24$@127.0.0.1:19999/indust-app'

if (env === 'development') {
  dbUrl = 'mongodb://localhost/indust-app'
}

mongoose.Promise = require('bluebird')
mongoose.connect(dbUrl)

var models_path = path.join(__dirname, '/app/models')

var walk = function(modelPath) {
  fs
    .readdirSync(modelPath)
    .forEach(function(file) {
      var filePath = path.join(modelPath, '/' + file)
      var stat = fs.statSync(filePath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(filePath)
        }
      }
      else if (stat.isDirectory()) {
        walk(filePath)
      }
    })
}

walk(models_path)

var koa = require('koa')
var logger = require('koa-logger')
var session = require('koa-session')
var bodyParser = require('koa-bodyparser')
var app = koa()

app.keys = ['imooc']
app.use(logger())
app.use(session(app))
app.use(bodyParser())

var router = require('./config/routes')()

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3003)
console.log('Listening: 3003')
