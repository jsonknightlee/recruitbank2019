const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const paginate = require('express-paginate');
const cors = require('cors');
let session = require('express-session');
let passport = require('passport');
let expressValidator = require('express-validator');
let LocalStrategy = require('passport-local').Strategy;
let multer = require('multer');
let upload = multer({ dest:'./public/images'});
let flash = require('connect-flash');
let bcrypt = require('bcryptjs');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();


//Make moment a global letiable so we an use it as a function
app.locals.moment = require('moment');
 
//Truncate
app.locals.truncateText = function(text, length){
  let truncateText =  text.substring(0, length);
  return truncateText;
}
 
//Upper Case First Letter
app.locals.ucfirst = function(value){
    return value.charAt(0).toUpperCase() + value.slice(1);
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);

//Handle Sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));


//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
      let namespace =  param.split('.')
      , root =  namespace.shift()
      , formParam = root;
       
      while(namespace.length){
          formParam += '[' + namespace.shift() + ']';
      }
      return {
          param: formParam,
          msg: msg,
          value: value
      };    
  },

  customValidators: {
      isImage: function(value, filename) {
   
          var extension = (path.extname(filename)).toLowerCase();
          switch (extension) {
              case '.jpg':
                  return '.jpg';
              case '.jpeg':
                  return '.jpeg';
              case  '.png':
                  return '.png';
              default:
                  return false;
          }
      }
  }
}));

/* CORS */

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
 



app.use(flash());

app.use(function (req, res, next) {
res.locals.messages = require('express-messages')(req, res);
next();
});

//Make a global letiable that will tell us we are logged in
//Place befor routes middleware
app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

app.use(paginate.middleware(10, 50));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
