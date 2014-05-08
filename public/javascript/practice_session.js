$(document).ready(function(){
  
  var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  start_conversation();
  var conversation_id = 3;

  //steps... check for fb_instance ref and if chatroom has one peer connection
  //if there is a peer connection
  function start_conversation(){
    
    var id, call;

    function connect_to_peer(){
      var peer = new Peer({ key: '2lu517mph5btke29', debug: 3 });

      peer.on('open', function(peer_id){
            id = peer_id;
            var practice = fb_instance.child('practice_sessions').child(conversation_id);
            practice.child('peers').on('value', function(snapshot){
              if(snapshot.val() && snapshot.val().peer_id != id){
                //other user is logged in
                var other_id = snapshot.val().peer_id; 
           
                call = peer.call(other_id, window.localStream);
                call.on('stream', function(stream){
                  $('#their-video').prop('src', URL.createObjectURL(stream));
                });

              } else {
                //other user is not logged in
                practice.child('peers').set({peer_id : id});
                   // Receiving a call
                peer.on('call', function(call){
                  call.answer(window.localStream);
                });
            }
      });
   
      peer.on('error', function(err){
        alert(err.message);
      });
    });
  }

    navigator.getUserMedia({audio: true, video: true}, function(stream){
          // Set your video displays
          $( '#my-video').prop('src', URL.createObjectURL(stream));
          window.localStream = stream;
          connect_to_peer();
        }, function(){ alert("Camera disabled."); }); 
  }
});