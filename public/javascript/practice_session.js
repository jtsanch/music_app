$(document).ready(function(){

//variables
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");

  var session_id  = $("#session_id").val();
  var if_musician = $("#if_musician").val();
  
  var practice_session = fb_instance.child('practice_sessions').child(session_id);
  
  //recording elements
  var canvas = document.createElement('canvas'); // offscreen canvas.
  var rafId = null;
  var startTime = null;
  var endTime = null;
  var frames = [];

  function toggle(button) {
      switch(button.value) {
          case "Start rehearsal":
               button.value = "Stop rehearsal";
               start_recording();
               break;
          case "Stop rehearsal":
               //update fb is_recording value, start recording and switch critiquer's interface
               button.value = "Start rehearsal";
               stop_recording();
               break;
      }
  }

  //steps... check for fb_instance ref and if chatroom has one peer connection
  //if there is a peer connection
  function start_conversation(){
    
    var id, call;
    var peer = new Peer({key: '2lu517mph5btke29'});
     
    if(if_musician == "true"){
      //we need to await the call
      $("#start_session").on("click", function(snapshot){
        //on first button click, toggle to stop
        if($("#start_session").value == "Start Session") {
          practice_session.child('practice_start').set(new Date().getTime());
          $("#start_session").value("End Session");
          start_recording();
        } else {
          practice_session.child('practice_end').set(new Date().getTime());
          $("#start_session").hide();
          stop_recording();
          $('#practice-container').hide();
          $('#playback-container').show();
        }
        
      });
      peer.on('open', function(peer_id){

        practice_session.child("musician_peer_id").set(peer_id);

        practice_session.child("musician_id").set(current_user.id);

        //await the call from the crtiquer. Just chill out in the window
        peer.on('call', function(call){
          call.answer(window.localStream);
          call.on('stream', function(stream){

            $("#their-video").prop('src', URL.createObjectURL(stream));
         
          });
        });
      });
     } else {
      practice_session.child('session_start').on('value', function(snapshot){
        //button has been pressed

      });
      //we are the critiquer and need to make the call
      practice_session.child('musician_peer_id').on('value',function(snapshot){
        if(snapshot.val()){
          var musician_peer_id = snapshot.val();
          call = peer.call(musician_peer_id, window.localStream);

          //call your musician friend and establish the connection
          call.on('stream', function(stream){
              $("#their-video").prop('src', URL.createObjectURL(stream));
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


  //called upon the button being clicked
  function start_recording(){
    
    // $("#begin_recording").hide();
    // $("#end_recording").show();

    var ctx = canvas.getContext('2d');
    var CANVAS_HEIGHT = canvas.height;
    var CANVAS_WIDTH = canvas.width;

    frames = []; // clear existing frames;
    startTime = Date.now();

    function drawVideoFrame_(time) {
      rafId = requestAnimationFrame(drawVideoFrame_);

      ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      var url = canvas.toDataURL('image/webp', 1); // image/jpeg is way faster :(
      //console.timeEnd('canvas.dataURL() took');
      frames.push(url); 
    }

    rafId = requestAnimationFrame(drawVideoFrame_);
  } 

//called when teh musician stops recording
  function stop_recording() {

    cancelAnimationFrame(rafId);
    
    endTime = Date.now();

    begin_critique_session();
       
  }

//called when session begins
  function begin_critique_session(){
    var webmBlob = Whammy.fromImageArray(frames, 1000 / 60);
    url = window.URL.createObjectURL(webmBlob);
    $("#critique_video").src = url;      

    if(if_musician != "false"){
      
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
        }, 
        false);

      $("#critique_text").keydown(function(e){
        e = e || event;
        if ( e.which == 13 && !e.ctrlKey){
          var now = new Date().getTime();
          var text = $(this).val();
          $(this).val("");
          add_critique_item(now, text, "neutral");
        }
      });

      $(".up").on("click",function(){
        var now = new Date().getTime();
        var topic = $(this).attr('id');
        var text = "Good "+topic+"!";
        add_critique_item(now, text, "positive");
      });

      $(".down").on("click",function(){
        var now = new Date().getTime();
        var topic = $(this).attr('id');
        var text = "Work on "+topic;
        add_critique_item(now, text, "negative");
      });
    }

    render_critique();
  }

//renders the critique
  function render_critique(){
    //create dictionary of [sent time of critique] -> text of critique
    var critiques;
    practice_session.child('critiques').on('value', function(snapshot){
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
  function add_critique_item( sent_at, text, type){
    practice_session.child('critiques').push({text:text, sent: sent_at, type:type});

    $("#critiques").append("<div class='indivCritiques "+type+"' id='"+sent_at+"'>"+
      "<span class='timestamp'>"+sent_at+": </span>"+
      text +"</div>");
  }
  
  navigator.getUserMedia({audio: true, video: true}, function(stream){
      // Set your video displays
      $('#my-video').prop('src', URL.createObjectURL(stream));
      window.localStream = stream;
      start_conversation();
  }, function(){ alert("Camera disabled."); });  

});