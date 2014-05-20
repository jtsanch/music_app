/* Socket io notes
// using rooms https://github.com/LearnBoost/socket.io/wiki/Rooms
// send to current request socket client
socket.emit('message', "this is a test");

// sending to all clients, include sender
io.sockets.emit('message', "this is a test");

// sending to all clients except sender
socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
io.sockets.in('game').emit('message', 'cool game');

// sending to individual socketid
io.sockets.socket(socketid).emit('message', 'for your eyes only');
*/
module.exports = function(io){
  var current_users = {};
  io.set('log level', 1);
  io.sockets.on('connection',function(socket){

    socket.emit('connected',{m:'ok'});

    socket.on('user_connect',function(data){

      current_users[socket.id] = data;
      io.sockets.emit('user_ping',{m:data});
      window.setInterval(function(){
        io.sockets.emit('user_ping',{m:data});
        console.log('pinged users');
      }, 30000);

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
}