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
     
     //musician
    if(if_musician == "true"){
      //we need to await the call
      $("#start_session").on("click", function(snapshot){
        //on first button click, toggle to stop
<<<<<<< HEAD
        if($("#start_session").val() == "Start Session") {
=======
        if($("#start_session").val() === "Start Session") {
         console.log("started session");
>>>>>>> ef2fb29485727711db4a261d3e1cd93529a6321e
          practice_session.child('practice_start').set(new Date().getTime());
          $("#start_session").val("End Session");
          start_recording();
        } else {
          practice_session.child('practice_end').set(new Date().getTime());
          stop_recording();
          $("#start_session").hide();
          $('#practice-container').hide();
          $('#playback-container').show();
        }
        
      });

      peer.on('open', function(peer_id){

        practice_session.child("musician_peer_id").set(peer_id);

        practice_session.child("musician_id").set(current_user.id);

        //await the call from the crtiquer. Just chill out in the window
        peer.on('call', function(call){
          $("#waiting_response").fadeOut();
          call.answer(window.localStream);
          call.on('stream', function(stream){

            $("#their-video").prop('src', URL.createObjectURL(stream));
         
          });
        });
      });
<<<<<<< HEAD
     
=======

      //critiquer
>>>>>>> ef2fb29485727711db4a261d3e1cd93529a6321e
     } else {

      practice_session.child('practice_start').on('value', function(snapshot){
        //button has been pressed
<<<<<<< HEAD
        if(snapshot.val() && if_musician){
          $("#critique_text").keyup( function(e){
            e = e || event;
            if ( e.keyCode === 13 && !e.ctrlKey){
              var now = new Date().getTime();
              var text = $("#critique_text");
              add_critique_item(now, text);
            }
          });
        
          $(".critique_rating").on("click",function(){
            add_critique(""+$(this).id);
          });

          start_recording();
        }
      });

      practice_session.child('practice_end').on('value', function(snapshot){
        //button has been pressed
        if(snapshot.val() && if_musician){
          stop_recording();
        }
      
=======
        $("#waiting_button-panel").fadeOut();
        $("#waiting_critique").fadeOut();
>>>>>>> ef2fb29485727711db4a261d3e1cd93529a6321e
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
      var video;
      if(if_musician){
        video = document.querySelector('my-video');
      } else {
        video = document.querySelector('their-video');
      }

      ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      var url = canvas.toDataURL('image/webp', 1); // image/jpeg is way faster :(
      //console.timeEnd('canvas.dataURL() took');
      frames.push(url); 
    }

    rafId = requestAnimationFrame(drawVideoFrame_);
  } 
//


//called when teh musician stops recording
  function stop_recording() {

    cancelAnimationFrame(rafId);
    
    endTime = Date.now();

    begin_critique_session();
       
  }

//called when session begins
  function begin_critique_session(){
    var webmBlob = Whammy.fromImageArray(frames, 1000 / 60);

    $("#critique_video").prop('src', URL.createObjectURL(webmBlob));

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
<<<<<<< HEAD
        }, false);

=======
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
>>>>>>> ef2fb29485727711db4a261d3e1cd93529a6321e
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
  var ready = 0;  
   // record audio
  navigator.getUserMedia({audio: true}, function(mediaStream) {
    window.recordRTC_Audio = RecordRTC(mediaStream);
    ready += 1;
    if(ready == 2){
      record_audio_and_video();
    }
  
  },function(failure){
    console.log(failure);
  });

  // record video
  navigator.getUserMedia({video: true}, function(mediaStream) {
    $("#status").html("waiting..");
    window.recordRTC_Video = RecordRTC(mediaStream,{type:"video"});
    ready += 1;
    if(ready == 2){
      record_audio_and_video();
    }
  
  },function(failure){

  });


  navigator.getUserMedia({audio: true, video: true}, function(stream){
<<<<<<< HEAD
      //Set your video displeoays
      $( '#my-video').prop('src', URL.createObjectURL(stream));
=======
      // Set your video displays
      $('#my-video').prop('src', URL.createObjectURL(stream));
>>>>>>> ef2fb29485727711db4a261d3e1cd93529a6321e
      window.localStream = stream;
      
      start_conversation();
<<<<<<< HEAD

  }, function(){ alert("Camera disabled."); }); 
    
  //toggle start/stop button
  function toggle(button) {
      switch(button.val()) {
          case "Start rehearsal":
               button.val("Stop rehearsal");
               //update fb, start recording and switch critiquer's interface
               break;
          case "Stop rehearsal":
               //update fb is_recording value, start recording and switch critiquer's interface
               button.val("Start rehearsal");
               break;
      }
  }
=======
  }, function(){ alert("Camera disabled."); });  
>>>>>>> ef2fb29485727711db4a261d3e1cd93529a6321e

});