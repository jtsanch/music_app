$(document).ready(function(){
  
  var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var session_id  = $("#session_id");
  var if_musician = $("#if_musician");
  
  var practice_session = fb_instance.child('practice_sessions').child(session_id);

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

        practice_session.child("musician_peer_id").put(peer_id);

        practice_session.child("musician_id").put(current_id);

        //await the call from the crtiquer. Just chill out in the window
        peer.on('call', function(call){
          call.answer(window.localStream);
        });
      } else {
        //we are the critiquer and need to make the call
        practice_session.child('musician_id').on('value',function(){
          if(snapshot.val()){
            fb_instance.child('users').child(snapshot.val()).on('value', function(){
              if(snapshot.val()){
                var musician = snapshot.val();
                call = peer.call(musician.peer_id, window.localStream);

                //call your musician friend and establish the connection
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

    begin_critique_session();
       
  }

  function begin_critique_session(){
    var webmBlob = Whammy.fromImageArray(frames, 1000 / 60);
    url = window.URL.createObjectURL(webmBlob);
    $("#critique_video").src = url;      

    if(if_musician){
      
      $("#critique_video").on('timeupdate', function(){
        pratice_session.child('critique_video_time').put($("#critique_video").currentTime);
      });

    } else {

        document.getElementById("#critique_video").addEventListener('loadedmetadata', function() {
        
        //Only the musician can control the video      
        practice_session.child('critique_video_time').on('child_changed', function(snapshot){
            this.currentTime = snapshot.val(); 
            $("#critique_video").play();
          });
        }, false);
    }

    render_critique();
  }

  $("#critique_text").onkeyup = function(e){
    e = e || event;
    if ( e.keyCode === 13 && !e.ctrlKey){
      var now = new Date().getTime();
      var text = $("#critique_text");
      add_critique_item(now, text);
    }
  }

  function render_critique(){
    //create dictionary of [sent time of critique] -> text of critique
    var critiques;
    practice_session.child('critiques').on('value', function(snapshot()){
      if(snapshot.val()){
        for(var critique in snapshot.val()){
          critiques[critique.sent_at] = critique.text;
          add_critique_item(critique.sent_at, critique.text);
        }
      }
    });

    setInterval( function(){
      if( critiques[$("#critique_video").currentTime] ){
        var scroll_to = $("#"+crtiques[$("#critique_video").currentTime]);
        scroll_to.className = active_critique;
        $("#critiques").animate({
          scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
        });
      }
    },1000);


  }

  //render the critique item in the list
  function add_critique_item( sent_at, text){
  
    $("#critiques").append("<li id='"+sent_at+"'>"+text+"<br\>"+
      sent_at +"</li>");

  }
  //add a new critique item during critique session
  function add_critique( text ){

    var now = new Date().getTime();
    practice_session.child('critiques').push({text:text, sent: now});

  }
  navigator.getUserMedia({audio: true, video: true}, function(stream){
      // Set your video displays
      $( '#my-video').prop('src', URL.createObjectURL(stream));
      window.localStream = stream;
      start_conversation();
    }, function(){ alert("Camera disabled."); }); 
  }

});