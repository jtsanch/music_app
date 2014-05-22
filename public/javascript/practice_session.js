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

  //hide navbar for chatroom
  $(".navbar").hide();

  //instance vars
  var critiqueBarLen = 600;
  var halfWidthCritique = 5;

  //start the conversation link after streams have been allowed
  function start_conversation(){

    var video_peer = new Peer({key: 'sgi0gh4qeao9wwmi'});
    var audio_peer = new Peer({key: 'sgi0gh4qeao9wwmi'});
     
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

  var time_start;

  //init the musician listeners
  function initialize_musician(video_peer, audio_peer){
    
      $("#start_session").on("click", function(snapshot){
        //on first button click, toggle to stop
        if($("#start_session").val() == "Start Session") {
          practice_session.child('practice_start').set(new Date().getTime());
          $("#start_session").val("End Session");
          $('#practice-container').show();
          start_recording();
          time_start = new Date().getTime();
        } else {
          practice_session.child('practice_end').set(new Date().getTime());
          stop_recording();
          $("#start_session").hide();
          $('#practice-container').hide();
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
            $("#waiting_response").hide();         
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
            $("#waiting_response").hide();  
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
          
          time_start = new Date().getTime();
          $("#critique_text").keydown(function(e){
            e = e || event;
            if ( e.which == 13 && !e.ctrlKey){
              var now = new Date().getTime();
              var text = $(this).val();
              var sent_at = Math.floor((now-time_start)/1000);
              $(this).val("");
              add_critique_item(sent_at, text, "neutral");
            }
          });

          $(".up").on("click",function(){
            var now = new Date().getTime();
            var topic = $(this).val();
            var text = "Good "+topic+"!";
            var sent_at = Math.floor((now-time_start)/1000);
            add_critique_item(sent_at, text, "positive");
          });

          $(".down").on("click",function(){
            var now = new Date().getTime();
            var topic = $(this).val();
            var text = "Work on "+topic;
            var sent_at = Math.floor((now-time_start)/1000);
            add_critique_item(sent_at, text, "negative");
          });

          $("#critique-panel").show();
          start_recording();
        }
      });

      practice_session.child('practice_end').on('value', function(snapshot){
        //button has been pressed
        if(snapshot.val()){
          $("#critique-panel").hide();
          stop_recording();
          begin_critique_session();
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
            }
            var other_peer_id = snapshot.val();
            var call = video_peer.call(other_peer_id, window.video_stream);

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
              $('#playback-container').show();
           }

            var other_peer_id = snapshot.val();
            var call = audio_peer.call(other_peer_id, window.audio_stream);

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
      window.recordRTC_Video.startRecording();
      window.recordRTC_Audio.startRecording(); 
    } else {
      window.musician_video_stream.startRecording();
      window.musician_audio_stream.startRecording();
    }

  } 


  function stop_recording() {

    if(if_musician){
      
      window.recordRTC_Audio.stopRecording(function(audioURL) {
        window.recordRTC_Video.stopRecording(function(videoURL) {
          $("#critique_video").prop('src',videoURL);
          $("#critique_audio").prop('src', audioURL);

          var files = [ window.recordRTC_Audio.getBlob(), window.recordRTC_Video.getBlob()];

          var filename = session_id; 


          var bucket   = new AWS.S3({params: {Bucket: 'thesoundboard'}});
          var params   = {Key: filename, Body: new Blob(files) };
          bucket.putObject(params, function(err){
            if(err){
              console.log('file upload failed');
            } else {
              console.log('file upload successful');
            }
          });
        });
      });

    } else {
      
      window.musician_audio_stream.stopRecording(function(audioURL) {
        window.musician_video_stream.stopRecording(function(videoURL) {
          $("#critique_audio").prop('src', audioURL);
          $("#critique_video").prop('src',videoURL);
        });
      });
    }
       
  }

  function show_critique_items(){
    console.log("show_critique_items");
    // $("#their-video").css({
    //   "right": "20px",
    //   "width": "200px",
    //   "position": "absolute",
    //   "top": "50px",
    //   "height": "initial",
    //   "left": "initial"
    // });
    console.log("num their-videos:" + $("#their-video").length);
    $("#their-video").css({
      "position": "absolute",
      "top": "0px",
      "left": "350px",
      "width": "200px",
      "height": "450px",
    });

    $("#my-video").css({
      "position": "absolute",
      "top": "0px",
      "left": "-550px",
      "width": "200px",
      "height": "450px",
    });

    $(".video-container").css({
      "margin-left": "0px"
    });
  
    $("#critique_video").show();
    $("#critiques").show();
  }

  //called when session begins
  function begin_critique_session(){
    $(".memo").hide();
    show_critique_items();
    var critique_audio = document.getElementById('critique_audio');
    var critique_video = document.getElementById('critique_video');

    if(if_musician){

      // musician's video will move based on what the critiquer did
      critique_video.addEventListener('loadedmetadata', function() {   
          practice_session.child('critique_video_time').on('value', function(snapshot){
            
            if(snapshot.val()){    
              critique_video.currentTime = snapshot.val().time;
              critique_audio.currentTime = snapshot.val().time;
              if(!snapshot.val().paused){
                critique_video.play();
                critique_audio.play(); 
              } else {
                critique_video.pause();
                critique_audio.pause();
              }
            }

          });
         }, false);

    } else {
      $("#critique_video").on('timeupdate', function(){

        critique_audio.currentTime = critique_video.currentTime;
        practice_session.child('critique_video_time').set( {time:critique_video.currentTime, paused: critique_video.paused });

        if(critique_video.paused){
          critique_audio.pause();
        } else {
          critique_audio.play();
        }
      });

      $("#critique_video").on('pause', function(){
        practice_session.child('critique_video_paused').set(true);
        critique_audio.pause();
      });

    }
    var total_len = $("#critique_video").duration;
    render_critique(total_len);
  }

  //renders the critique
  function render_critique(total_len){

    //create dictionary of [sent time of critique] -> text of critique
    var critiques = [];
    practice_session.child('critiques').on('value', function(snapshot){
      if(snapshot.val()){
        for(var critique_key in snapshot.val()){

          var critique = snapshot.val()[critique_key];
          
          critiques[critique.sent] = critique.text;

          //might need to cancel this and make it for both
          if(if_musician)
            add_critique_item(critique.sent, total_len, critique.text, critique.type, true);
        }


      }
    });


    setInterval( function(){
      var time = Math.round($("#critique_video").prop('currentTime'));
      if( critiques[time] ){
        var scroll_to = $("#critique_at_"+time);
        scroll_to.className = 'active_critique';
     /*   $("#critiques").animate({
          scrollTop: scroll_to.offset().top - container.offset().top + container.scrollTop()
        });*/
        $("#active_critique").html(critiques[time]);
      }
    },500);

  }

  //render the critique item in the list
  function add_critique_item(sent_at, total_len, text, type, rendering){
//sent_at is in seconds
    var pixPerSec = critiqueBarLen/total_len;

    var displacePix = (sent_at*pixPerSec)-halfWidthCritique;
    // var mins = Math.floor(sent_at/60);
    // var seconds = sent_at%60;
    // if(seconds<10)
    //   seconds = "0"+seconds;
    // var timestamp = mins + ":" + seconds;

    var newCritique = $("#critiques").append("<div class='indivCritiques "+type+"' value='"+sent_at+"'></div>");
    newCritique.css({
      "left": displacePix
    });
    
    //add to DB
    if(!rendering)
      practice_session.child('critiques').push({sent:sent_at, text:text, type:type});
  }

  var ready = 0;  
   // record audio
  navigator.getUserMedia({audio: true}, function(mediaStream) {
    if(if_musician){
      window.recordRTC_Audio = RecordRTC(mediaStream, {type:"audio"});  
      practice_session.child('musician_audio_connected').set(true);
    } else {
      practice_session.child('critiquer_audio_connected').set(true);
    }
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
    if(if_musician){
       window.recordRTC_Video = RecordRTC(mediaStream,{type:"video"});  
       practice_session.child('musician_video_connected').set(true); 
    } else {
       practice_session.child('critiquer_video_connected').set(true);
    }
    window.video_stream    =  mediaStream;
    ready += 1;
    if(ready == 2){
      start_conversation();
    }
  
  },function(failure){
    console.log(failure);
  });

});