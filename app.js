require('dotenv').config();
const express = require('express');
require('./db');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const authentication = require('./routes/authentication');
const movies = require('./routes/movies');
const user = require('./routes/user');
const cors = require('cors');

const passport = require("passport");
const { strategy } = require('./strategies/jwt');
require('./db');
passport.use(strategy);
const app = express();

// Allow cors for developing purpose
app.use(cors());

app.use(logger('dev'));
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', index);
app.use('/', authentication);
app.use('/user', user);
app.use('/movies', passport.authenticate('jwt', { session: false }), movies);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  const message = err.message;
  const error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message,
    error,
  })
});

module.exports = app;
