$(document).ready(function(){

//variables
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");

  var session_id  = $("#session_id").val();
  var if_musician = $("#if_musician").val() == "true";
  
  //load the practice session
  var practice_session = fb_instance.child('practice_sessions').child(session_id);
  
  //recording elements
  var canvas = document.createElement('canvas'); // offscreen canvas.
  var rafId = null;
  var startTime = null;
  var endTime = null;
  var frames = [];

  //start the conversation link after streams have been allowed
  function start_conversation(){

    var id;
    var video_peer = new Peer({key: '2lu517mph5btke29'});
    var audio_peer = new Peer({key: '2lu517mph5btke29'});
     
    //musician
    if(if_musician){
      //we need to await the call
      initialize_musician(video_peer, audio_peer);
     } else {
      initialize_critiquer(video_peer, audio_peer);
    }

    video_peer.on('error', function(err){
      alert(err.message);
    });

    audio_peer.on('error', function(err){
      alert(err.message);
    });
  }

  //init the musician listeners
  function initialize_musician(video_peer, audio_peer){
    
      $("#start_session").on("click", function(snapshot){
        //on first button click, toggle to stop
        if($("#start_session").val() == "Start Session") {
          practice_session.child('practice_start').set(new Date().getTime());
          $("#start_session").val("End Session");
          $('#practice-container').show();
          start_recording();

        } else {
          practice_session.child('practice_end').set(new Date().getTime());
          stop_recording();
          $("#start_session").hide();
          $('#practice-container').hide();
          $('#playback-container').show();
          begin_critique_session();
        }
        
      });

      var peers_logged_in = 0;
      video_peer.on('open', function(peer_id){
        
        practice_session.child("musician_video_peer_id").set(peer_id);
        peers_logged_in += 1;

        //await the call from the crtiquer. Just chill out in the window
        video_peer.on('call', function(call){
          if(peers_logged_in == 2){
            $("#waiting_response").fadeOut();         
            $('#playback-container').show();   
          }
          call.answer(window.video_stream);
          call.on('stream', function(stream){
            $("#their-video").prop('src', URL.createObjectURL(stream));
          });
        });
      });

      audio_peer.on('open', function(peer_id){
        
        peers_logged_in += 1;
        practice_session.child("musician_audio_peer_id").set(peer_id);

        //await the call from the crtiquer. Just chill out in the window
        audio_peer.on('call', function(call){
          if(peers_logged_in == 2){
            $("#waiting_response").fadeOut();  
            $('#playback-container').show();          
          }
          call.answer(window.audio_stream);
          call.on('stream', function(stream){
            $("#their-audio").prop('src', URL.createObjectURL(stream));
          });
        });
      });
  }

  //init critique items
  function initialize_critiquer(video_peer, audio_peer){

      practice_session.child('practice_start').on('value', function(snapshot){
        if(snapshot.val()){
          $("#critique_text").keyup( function(e){
            e = e || event;
            if ( e.keyCode === 13 && !e.ctrlKey){
              var now = new Date().getTime();
              var text = $("#critique_text");
              add_critique_item(now, text);
            }
          });
        
          $(".critique_rating").on("click",function(){
            add_critique($(this).id);
          });

          start_recording();
        }
      });

      practice_session.child('practice_end').on('value', function(snapshot){
        //button has been pressed
        if(snapshot.val()){
          stop_recording();
          $("#waiting_button-panel").fadeOut();
          $("#waiting_critique").fadeOut();
        }
      });
      
      //we are the critiquer and need to make the call
      var peers_logged_in = 0;
      video_peer.on('open', function(peer_id){
        practice_session.child('musician_video_peer_id').on('value', function(snapshot){
          if(snapshot.val()){
            peers_logged_in+=1;
            if(peers_logged_in == 2){
              $('#playback-container').show();
              $('#waiting-response').fadeOut();
            }
            var peer_id = snapshot.val();
            var call = video_peer.call(peer_id, window.video_stream);

            //call your musician friend and establish the connection
            call.on('stream', function(stream){
                $("#their-video").prop('src', URL.createObjectURL(stream));
                window.musician_video_stream = RecordRTC(stream, {type:'video'});
            });

          }
        });
      });

      audio_peer.on('open', function(peer_id){
        
        practice_session.child('musician_audio_peer_id').on('value', function(snapshot){
          if(snapshot.val()){
            peers_logged_in+=1;
            if(peers_logged_in == 2){
              $("#waiting-response").fadeOut();
              $('#playback-container').show();
           }

            var peer_id = snapshot.val();
            var call = audio_peer.call(peer_id, window.audio_stream);

            call.on('stream', function(stream){
              $("#their-audio").prop('src', URL.createObjectURL(stream));
              window.musician_audio_stream = RecordRTC(stream, {type:'audio'});
            })
          }
        });
 
      });
  }

  function start_recording(){

    if(if_musician){
      recordRTC_Video.startRecording();
      recordRTC_Audio.startRecording(); 
    } else {
      window.musician_video_stream.startRecording();
      window.musician_audio_stream.startRecording();
    }

  } 


  function stop_recording() {

    if(if_musician){
      recordRTC_Audio.stopRecording(function(audioURL) {
        $("#critique_audio").prop('src', audioURL);
      });

      recordRTC_Video.stopRecording(function(videoURL) {
        $("#critique_video").prop('src',videoURL);
      });
    } else {
      window.musician_audio_stream.stopRecording(function(audioURL) {
        $("#critique_audio").prop('src', audioURL);
      });

      window.musician_video_stream.stopRecording(function(videoURL) {
        $("#critique_video").prop('src',videoURL);
      });
    }
       
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

  var ready = 0;  
   // record audio
  navigator.getUserMedia({audio: true}, function(mediaStream) {
    window.recordRTC_Audio = RecordRTC(mediaStream, {type:"audio"});
    window.audio_stream    = mediaStream;
    $("#my-audio").prop('src', URL.createObjectURL(mediaStream));
    ready += 1;
    if(ready == 2){
      start_conversation();
    }
  
  },function(failure){
    console.log(failure);
  });

  // record video
  navigator.getUserMedia({video: true}, function(mediaStream) {
    $("#status").html("waiting..");
    $("#my-video").prop('src', URL.createObjectURL(mediaStream));
    window.recordRTC_Video = RecordRTC(mediaStream,{type:"video"});
    window.video_stream    =  mediaStream;
    ready += 1;
    if(ready == 2){
      start_conversation();
    }
  
  },function(failure){

  });

});