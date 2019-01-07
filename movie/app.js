var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var serveStatic = require('serve-static')
var logger = require('morgan');
var cookieParser = require('cookie-parser')

var mongoose = require('mongoose')
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var port = 4000 || 6000;
var app = express()
var fs = require('fs')
var path = require('path')
var dbUrl = 'mongodb://127.0.0.1:27017/imooc-movie'

mongoose.connect(dbUrl, { useNewUrlParser: true }, function (err) {
  if (!err) {
    console.log('Mongoose connect success!')
  }
})

// models loading
var models_path = __dirname + '/app/models'
var walk = function (path) {
  fs
    .readdirSync(path)
    .forEach(function (file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      }
      else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}
walk(models_path)

app.set('views', path.resolve(__dirname, './app/views/pages'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
  secret: 'imooc-movie',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    url: dbUrl
  })
}
));

if ('development' === app.get('env')) {
  app.set('showStackError', true)
  app.use(logger(':method :url :status'))
  app.locals.pretty = true
  mongoose.set('debug', true)
}

require('./config/routes')(app)



app.locals.moment = require('moment')
app.use(serveStatic(path.join(__dirname, 'public')))


app.listen(port)

console.log('imooc started on port ' + port)

