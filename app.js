var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express3-handlebars');
var routes = require('./routes/index');
var users = require('./routes/users');
var practice = require('./routes/practice_session');
var Firebase = require('firebase');
var http = require('http');3
//var FirebaseSimpleLogin = require('./bower_components/firebase-simple-login');
var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");
var about = require('./routes/about');
var help = require('./routes/help');

var app = express();
app.locals.Firebase = Firebase;

// view engine setup
// view engine setup
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//home page
app.get('/', routes.index);

//about page
app.get('/about', about.view);
app.get('/help', help.view);

//user navigation pages
app.get('/users/:id', users.show);
app.get('/login', users.login);
app.get('/register', users.register);
app.get('/home', users.home);

//practice session pages
app.get('/practice/:session_id/:if_musician', practice.show);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.listen(3000);
console.log("listening now");

var current_users = {};
io.set('log level', 1);
io.sockets.on('connection',function(socket){

socket.emit('connected',{m:'ok'});

socket.on('user_connect',function(data){

  current_users[socket.id] = data;
  io.sockets.emit('user_ping',{m:data});
  console.log('user connected ' +data);
/*  window.setInterval(function(){
    io.sockets.emit('user_ping',{m:data});
    console.log('pinged users');
  }, 30000);*/

});

//if user doesn't ping in two minutes, it's removed from
//current users
socket.on('user_ping', function(data){
  console.log(data + " just pinged us");s
  current_users[data] = true;
});

//when the user has left the site
socket.on('user_disconnect', function(data){
  delete current_users[data];
});

socket.on('disconnect',function(){
  user = current_users[socket.id];
      io.sockets.emit('user_disconnect', {m:user})
    });
});
