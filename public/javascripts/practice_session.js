$(document).ready(function(){
  
  var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  start_conversation();

  //steps... check for fb_instance ref and if chatroom has one peer connection
  //if there is a peer connection
  function start_conversation(){
    // PeerJS object
    var peer = new Peer({ key: '2lu517mph5btke29', debug: 3 });
    var id;
    peer.on('open', function(peer_id){
      id = peer_id;
      fb_instance.child('practice_sessions').child(id);
    });

    // Receiving a call
    peer.on('call', function(call){
      // Answer the call automatically (instead of prompting user) for demo purposes
      call.answer(window.localStream);
    });

    peer.on('error', function(err){
      alert(err.message);
      call = peer.call(other_id, window.localStream);
      // Return to step 2 if error occurs
    });
   
    navigator.getUserMedia({audio: true, video: true}, function(stream){
      // Set your video displays
        $('#my-video').prop('src', URL.createObjectURL(stream));
        window.localStream = stream;
        // Wait for stream on the call, then set peer video display

        call = peer.call(other_id, window.localStream);
        call.on('stream', function(stream){
          $('#their-video').prop('src', URL.createObjectURL(stream));
        });

      }, function(){ $('#step1-error').show(); });
  }
});