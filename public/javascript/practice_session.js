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
  $("#navi").hide();

  //instance vars
  var critiqueBarLen = 600;
  var halfWidthCritique = 5;
  var critiqueItems = [];
  var time_start;
  var recordDuration;
  var currently_recording = false;
  var timeline;
  var critique_start;
  var zeroTime = new Date(2014,1,1,0,0,0);

  //make the timeline
  function makeTimeline(){
    var container = document.getElementById('critiques');
    var options = {
      autoResize: false,
      end: zeroTime.getTime()+5000,
      start: zeroTime,
      min: zeroTime,
      height: '100px',
      showMajorLabels: false,
      showMinorLabels: false,
      zoomMax: 5000,
      orientation: 'top'
    };
    timeline = new vis.Timeline(container, critiqueItems, options);
  }

  //start the conversation link after streams have been allowed
  function start_conversation(){
    $("#body-wrapper").hide();

    var video_peer = new Peer({key: 'ewdyikcaj7nwmi'});
    var audio_peer = new Peer({key: 'ewdyikcaj7nwmi'});
     
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

    //draws a new timeline with specified totalDuration
    makeTimeline();
  }


  //init the musician listeners
  function initialize_musician(video_peer, audio_peer){
      var toggle_critique = false;

      $("#start_session").on("click", function(snapshot){
        //on first button click, toggle to stop
        if($("#start_session").val() == "Start recording") {
          practice_session.child('practice_start').set(new Date().getTime());
          $("#start_session").val("End recording");
          $('#start_session').css({"background-color": "#8A3E55"});
          $("#recording").fadeTo("slow",1.0);
          $('#practice-container').show();
          $(".musician_practice_item").show();
          $(".memo").hide();
          
          $("#their-audio").prop("muted");
          start_recording();
        } else {
          practice_session.child('practice_end').set(new Date().getTime());
          stop_recording();
          $("#their-audio").removeProp("muted");
          $("#start_session").fadeOut();
          $("#recording").fadeOut();
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
            // $(".memo").hide();
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
        
          $("#critique-panel").show();
          $("#waiting_comment-panel").fadeOut();
          $(".memo").hide();


          // $("#recording").show();
          console.log("change opacity");
          $("#recording").fadeTo("slow",1.0);
          // #("#recording").toggleClass("glow");

          $("#comment-textbox").keydown(function(e){
            e = e || event;
            if ( e.which == 13 && !e.ctrlKey){ //enter
              var text = $(this).val();
              var now = new Date().getTime();
              var sent_at = critique_start - time_start; //msec point in video where it starts
              var duration = 1000;
              add_critique_item_db(sent_at, duration, text, "comment");
              add_critique_item(sent_at, duration, text, "comment");
              $(this).val("");
            } else if($(this).val().length == 0){//first character
              critique_start = new Date().getTime();
            }
          });

          start_recording();
        }
      });

      practice_session.child('practice_end').on('value', function(snapshot){
        //button has been pressed
        if(snapshot.val()){
          $("#critique-panel").hide();
          $("#recording").fadeOut();
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

    time_start = new Date().getTime();
    currently_recording = true;

    if(if_musician){
      window.recordRTC_Video.startRecording();
      window.recordRTC_Audio.startRecording(); 
      var timeElapsed = 0;

    } else { //critiquer
      window.musician_video_stream.startRecording();
      window.musician_audio_stream.startRecording();

      //redraw the critique timeline every 0.5 seconds
      setInterval( function(){
        var now = new Date().getTime();
        if (currently_recording){
          var timeElapsed = now - time_start;
          if (timeElapsed > 10000){
            timeline.setOptions({
              end:zeroTime.getTime()+timeElapsed,
              zoomMax: timeElapsed
            });
          }
        }
      },500);
    }
  } 


  function stop_recording() {

    currently_recording = false;
    var now = new Date().getTime();
    recordDuration = now-time_start;

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
  
    $("#critique_video_wrapper").show();
    // $("#critique_video").show();
  }

//modified from http://html5etc.wordpress.com/2011/11/27/a-basic-html5-video-scrub-bar-using-jquery/
  function setup_scrubber(){
    var critique_audio = document.getElementById('critique_audio');
    var critique_video = document.getElementById('critique_video');
    var $video = $("#critique_video");
    var $scrubber = $("#scrubber");
    var $progress = $("#progress");
    
    //only give control if critiquer
    $video.bind("timeupdate", videoTimeUpdateHandler);
    if (!if_musician){
      $scrubber.bind("mousedown", scrubberMouseDownHandler);
    };
    
    function videoTimeUpdateHandler(e) {
        var video = $video.get(0);
        var percent = video.currentTime / video.duration;
        updateWidth(percent);
    }
    
    function scrubberMouseDownHandler(e) {
        var x = e.pageX - $(this).offset().left;
        var percent = x / $(this).width();
        updateWidth(percent);
        updateTime(percent);
    }
    
    function updateWidth(percent) {
        $progress.width((percent * 100) + "%");
    }
    
    function updateTime(percent) {
        var video = $video.get(0);
        video.currentTime = percent * video.duration;
    }

    //initialize value
    $("#play_pause").val("paused");

    //toggle on click
    $("#play_pause").on('click', function(){
      if ($(this).val()==="paused"){ //play the video and show pause
        playPlayback();
      }else{ //pause the video and show the play button
       pausePlayback();
      }
    });
  }

  function playPlayback(){
    $("#play_icon").hide();
        $("#pause_icon").show();
        $(this).val("playing");

        critique_video.play();
        critique_audio.play();
  }
  
  function pausePlayback(){
     $("#play_icon").show();
      $("#pause_icon").hide();
      $(this).val("paused");

      critique_video.pause();
      critique_audio.pause();
  }
  
  var control = !if_musician;
  
  //called when session begins
  function begin_critique_session(){
    $('#buttons').fadeOut();
    $('#settings').show();
    $('#full-comments').show();
    $("#exit_save").fadeIn();
    $(".critique_session_item").show();
    show_critique_items();
    setup_scrubber();
    var critique_audio = document.getElementById('critique_audio');
    var critique_video = document.getElementById('critique_video');
    
    //video control if you are the critiquer
    var video_control = !if_musician;
    var counter = 0; //so we can know how many times people switch videos
    
    practice_session.child('video_control').on('value', function(snapshot){
      if(snapshot.val() && !video_control){
        $("#toggle_video_control").class = 'btn btn-primary active';
        counter += 1;
        video_control = false;
      }
    });

    $("toggle_video_control").on('click', function(){
      if(!video_control){
        video_control = true;
        counter += 1;
        practice_session.child('video_control').set(counter);
      }
    });

    // musician's video will move based on what the critiquer did
    critique_video.addEventListener('loadedmetadata', function() {   
        practice_session.child('critique_video_time').on('value', function(snapshot){
            
          if(snapshot.val() && !video_control){    
            var time = snapshot.val().time;
            critique_video.currentTime = time;
            critique_audio.currentTime = time;
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

    $("#critique_video").on('timeupdate', function(){
      if(video_control){
        critique_audio.currentTime = critique_video.currentTime;
        practice_session.child('critique_video_time').set( {time:critique_video.currentTime, paused: critique_video.paused });

        if(critique_video.paused){
          critique_audio.pause();
        } else {
          critique_audio.play();
        }

      }
    });

    $("#critique_video").on('pause', function(){
      practice_session.child('critique_video_paused').set(true);
      critique_audio.pause();
    });

    timeline.on('select', function (properties) {
      var itemIndex = properties.items[0];
      var targetItem = critiqueItems[itemIndex];
      $("#" + targetItem.id).css({"background-color":"black"});
      var startDisplace = targetItem.start - zeroTime.getTime();//displace from start in msec
      //set new time for critiquer video in seconds
      critique_video.currentTime = startDisplace/1000;
  
      pausePlayback();
    });
    
    //make the dictionary for jumping to places
    render_critique();

    //dummy save button
    $("#save").on('mousedown', function(e){
      e.preventDefault();
      $(this).text("Coming Soon!");
    });
    $("#save").on('mouseup', function(e){
      e.preventDefault();
      $(this).text("Save Playback Video");
    });
  }

  function makeCritiqueTimeline(){
    $("#critiques_wrapper").css({
        "left": "400px"
      });
    if (if_musician){
      $("#critiques_wrapper").removeClass("hidden");
      timeline.setOptions({
        end: zeroTime.getTime()+recordDuration
      });
    }
  }

  //renders the critique for critique session
  function render_critique(){
    //create dictionary of [sent time of critique] -> text of critique
    var critiques = [];
    practice_session.child('critiques').on('value', function(snapshot){
      if(snapshot.val()){
        for(var critique_key in snapshot.val()){

          var critique = snapshot.val()[critique_key];
          
          critiques[critique.sent] = critique.text;

          //musician needs a local copy of all the critiques
          if(if_musician)
            add_critique_item(critique.sent, critique.duration, critique.text, critique.type);
        }
      }
    });

    //set it so that the right critique highlights at the right moment
    setInterval( function(){
      var time = Math.round($("#critique_video").prop('currentTime'));
      if( critiques[time] ){
        $("#active_critique").html(critiques[time]);
      }
    },500);

    //show the thing
    makeCritiqueTimeline();
    $("#critiques").show();
  }

  //render the critique item in the list
  function add_critique_item_db(sent_at, duration, text, type){
      practice_session.child('critiques').push({sent:sent_at, duration: duration, text:text, type:type});
  }

  function add_critique_item(sent_at, duration, text, type){
    var sentMsec = sent_at;
    var startTime = zeroTime.getTime()+sent_at;
    var endTime = startTime+duration;
    var newItem = {
      id: critiqueItems.length,
      start: startTime,
      end: endTime,
      content: text,
      type: 'box',
      className: type
    }
    critiqueItems.push(newItem);
    //redraw
    timeline.setItems(critiqueItems);
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
