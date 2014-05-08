$(document).ready(function(){
  
  var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var session_id  = $("#session_id");
  var if_musician = $("#if_musician");

  //steps... check for fb_instance ref and if chatroom has one peer connection
  //if there is a peer connection
  function start_conversation(){
    
    var id, call;
    var peer = new Peer(current_user.peer_id, 
                { key: '2lu517mph5btke29', debug: 3 });
     
    if(if_musician){
      //we need to await the call
      peer.on('open', function(peer_id){
        fb_instance.child('practice_sessions').child("musician_peer_id").put(peer_id);

        var practice = fb_instance.child('practice_sessions').child(conversation_id);
        practice.child("musician_id").put(current_id);
        peer.on('call', function(call){
          call.answer(window.localStream);
        });
      } else {
        //we are the critiquer and need to make the call
        fb_instance.child('practice_sessions').child('musician_id').on('value',function(){
          if(snapshot.val()){
            fb_instance.child('users').child(snapshot.val()).on('value', function(){
              if(snapshot.val()){
                var musician = snapshot.val();
                call = peer.call(musician.peer_id, window.localStream);
                call.on('stream', function(stream){
                  $("their-video").prop('src', URL.createObjectURL(stream));
                });
              } else {
                //display error
              }
            });
          } else {
            //display error
          }
      });
    }
    peer.on('error', function(err){
      alert(err.message);
    });
  }

  navigator.getUserMedia({audio: true, video: true}, function(stream){
      // Set your video displays
      $( '#my-video').prop('src', URL.createObjectURL(stream));
      window.localStream = stream;
      start_conversation();
    }, function(){ alert("Camera disabled."); }); 
  }

  
});