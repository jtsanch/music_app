$(document).ready(function(){
  
  var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var session_id  = $("#session_id");
  var if_musician = $("#if_musician");
  
  var canvas = document.createElement('canvas'); // offscreen canvas.
  var rafId = null;
  var startTime = null;
  var endTime = null;
  var frames = [];
  
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

  function start_recording(){
    var ctx = canvas.getContext('2d');
    var CANVAS_HEIGHT = canvas.height;
    var CANVAS_WIDTH = canvas.width;

    frames = []; // clear existing frames;
    startTime = Date.now();

    toggleActivateRecordButton();

    function drawVideoFrame_(time) {
      rafId = requestAnimationFrame(drawVideoFrame_);

      ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      var url = canvas.toDataURL('image/webp', 1); // image/jpeg is way faster :(
      //console.timeEnd('canvas.dataURL() took');
      frames.push(url); 
    }

    rafId = requestAnimationFrame(drawVideoFrame_);
  } 

  function stop_recording() {
    cancelAnimationFrame(rafId);
    endTime = Date.now();
    $('#stop-me').disabled = true;
    document.title = ORIGINAL_DOC_TITLE;

    toggleActivateRecordButton();

    begin_critique_session();

    console.log('frames captured: ' + frames.length + ' => ' +
                ((endTime - startTime) / 1000) + 's video');

       
  }

  function begin_critique_session(){
    var webmBlob = Whammy.fromImageArray(frames, 1000 / 60);
    url = window.URL.createObjectURL(webmBlob);
    $("#critique_video").src = url;      

    if(if_musician){
      $("#critique_video").src = 
      render_critique();
    } else {
        document.getElementById("#critique_video").addEventListener('loadedmetadata', function() {
          fb_instance.child('practice_sessions').child(session_id).child('critique_video_time').on('child_changed', function(snapshot){
            this.currentTime = snapshot.val(); 
            $("#critique_video").play();
          });
          render_critique();
        }, false);
    }
  }

  function render_critique(){
    //set up firebase listeners for critique

    //
  }
  navigator.getUserMedia({audio: true, video: true}, function(stream){
      // Set your video displays
      $( '#my-video').prop('src', URL.createObjectURL(stream));
      window.localStream = stream;
      start_conversation();
    }, function(){ alert("Camera disabled."); }); 
  }

});