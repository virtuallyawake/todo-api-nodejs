var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('todo-api-nodejs:server');
var index = require('./routes/index');
var api = require('./routes/api');
var config  = require('config');
var passport = require('passport');

// Configure passport
require('./auth/passport')(passport);

// Mongodb connection set-up
var mongoose = require('mongoose');

// Use native promises
mongoose.Promise = global.Promise;

// Add mongoose query and promise support to express
require('express-mongoose');

mongoose.connect(config.db.connString, function(err) {
    if (err) throw err;
    debug("Mongodb connection successful.");
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(session({ secret: 'session secret' }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.post('/login', passport.authenticate('local'), function(req, res) {
    res.status(204).send({});
});
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
