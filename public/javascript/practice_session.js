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
      end: zeroTime.getTime()+5000,
      start: zeroTime,
      min: zeroTime,
      height: '150px',
      showMajorLabels: false,
      zoomMax: 36000000,
      type: 'rangeoverflow'
    };
    timeline = new vis.Timeline(container, critiqueItems, options);
  }

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

    //draws a new timeline with specified totalDuration
    makeTimeline();
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

      // //complimenting
      // $("#compliment-text").click(function() {
      //     console.log("compliment clicked");

      //     $("#compliment").animate({
      //       height: "200%"
      //     })

      //     $("#compliment-text").hide();
      //     $("#compliment-expanded").show();
      //     console.log("set bool to 1");
      // });

      // $("#compliment-button.submit").click(function() {
      //   console.log("compliment submitted");
      //   //if textarea has text - submit comment to database + add to timeline
      //   $("#compliment").animate({
      //     height: "100%"
      //   })
      //   $(':input[id="compliment-textbox"]').val(null);
      //   $("#compliment-expanded").hide();
      //   $("#compliment-text").show();

      // });

      // $("#compliment-button.cancel").click(function() {
      //   console.log("compliment cancelled");
      //   $("#compliment").animate({
      //     height: "100%"
      //   })
      //   $(':input[id="compliment-textbox"]').val(null);
      //   $("#compliment-expanded").hide();
      //   $("#compliment-text").show();
      // });

      // //commenting
      // $("#comment-text").click(function() {
      //     console.log("comment clicked");

      //     $("#comment").animate({
      //       height: "200%"
      //     })
      //     $("#comment-text").hide();
      //     console.log("comment text found: " + $("#comment-text").length);
      //     console.log("comment expanded found: " + $("#comment-expanded").length);
      //     $("#comment-expanded").show();
      //     console.log("expanded comment");
      // });

      // $("#comment-button.submit").click(function() {
      //   console.log("comment submitted");
      //   //if textarea has text - submit to database + add to timeline
      //   $("#comment").animate({
      //     height: "100%"
      //   })
      //   $(':input[id="comment-textbox"]').val(null);
      //   $("#comment-expanded").hide();
      //   $("#comment-text").show();

      // });

      // $("#comment-button.cancel").click(function() {
      //   console.log("comment cancelled");
      //   $("#comment").animate({
      //     height: "100%"
      //   })
      //   $(':input[id="comment-textbox"]').val(null);
      //   $("#comment-expanded").hide();
      //   $("#comment-text").show();
      // });

      // //suggestion
      // $("#suggestion-text").click(function() {
      //     console.log("suggestion clicked");

      //     $("#suggestion").animate({
      //       height: "200%"
      //     })

      //     $("#suggestion-text").hide();
      //     $("#suggestion-expanded").show();
      // });

      // $("#suggestion-button.submit").click(function() {
      //   console.log("suggestion submitted");
      //   //if textarea has text - submit to database + add to timeline
      //   $("#suggestion").animate({
      //     height: "100%"
      //   })
      //   $(':input[id="suggestion-textbox"]').val(null);
      //   $("#suggestion-expanded").hide();
      //   $("#suggestion-text").show();

      // });

      // $("#suggestion-button.cancel").click(function() {
      //   console.log("suggestion cancelled");
      //   $("#suggestion").animate({
      //     height: "100%"
      //   })
      //   $(':input[id="suggestion-textbox"]').val(null);
      //   $("#suggestion-expanded").hide();
      //   $("#suggestion-text").show();
      // });

      practice_session.child('practice_start').on('value', function(snapshot){
        if(snapshot.val()){
          
          time_start = new Date().getTime();
        
          $("#critique-panel").show();
          $("#waiting_comment-panel").fadeOut();


          // $("#comment-textbox").keydown(function(e){
          //   e = e || event;
          //   if ( e.which == 13 && !e.ctrlKey){ //enter
          //     var text = $(this).val();
          //     var ending = new Date().getTime();
          //     var sent_at = critique_start - time_start; //msec point in video where it starts
          //     var duration = ending - critique_start;
          //     add_critique_item_db(sent_at, duration, text, "comment");
          //     add_critique_item(sent_at, duration, text, "comment");
          //     $(this).val("");
          //   }else if(e.which == 8 || e.which==46) {//backspace/delete
          //     critique_start = new Date().getTime();
          //   }else if($(this).val().length == 0){//first character
          //     critique_start = new Date().getTime();
          //   } 
          // });

          // $("#compliment-textbox").keydown(function(e){
          //   if ( e.which == 13 && !e.ctrlKey){ //enter
          //     var text = $(this).val();
          //     var ending = new Date().getTime();
          //     var sent_at = critique_start - time_start; //msec point in video where it starts
          //     var duration = ending - critique_start;
          //     add_critique_item_db(sent_at, duration, text, "comp");
          //     add_critique_item(sent_at, duration, text, "comp");
          //     $(this).val("");
          //   }else if(e.which == 8 || e.which==46) {//backspace/delete
          //     critique_start = new Date().getTime();
          //   }else if($(this).val().length == 0){//first character
          //     critique_start = new Date().getTime();
          //   } 
          // });

          // $("#suggestion-textbox").keydown(function(e){
          //   if ( e.which == 13 && !e.ctrlKey){ //enter
          //     var text = $(this).val();
          //     var ending = new Date().getTime();
          //     var sent_at = critique_start - time_start; //msec point in video where it starts
          //     var duration = ending - critique_start;
          //     add_critique_item_db(sent_at, duration, text, "suggest");
          //     add_critique_item(sent_at, duration, text, "suggest");
          //     $(this).val("");
          //   }else if(e.which == 8 || e.which==46) {//backspace/delete
          //     critique_start = new Date().getTime();
          //   }else if($(this).val().length == 0){//first character
          //     critique_start = new Date().getTime();
          //   } 
          // });

          // $(".submit").on("click",function(){
          //   var type;
          //   if ($(this).attr('id') === 'compliment-button'){
          //     type='comp';
          //   }else if ($(this).attr('id') === 'comment-button'){
          //     type="comment";
          //   }else{
          //     type="suggest";
          //   }

          //   var ending = new Date().getTime();
          //   var text = $(this).val();
          //   var sent_at = critique_start - time_start; //msec point in video where it starts
          //   var duration = ending - critique_start;
          //   add_critique_item_db(sent_at, duration, text, type);
          //   add_critique_item(sent_at, duration, text, type);
          //   $(this).val("");
          // });

          // $(".cancel").on("click",function(){
          //   $(this).val("");
          //   //also close the div
          // });
          // //makiko's end

          // $("#option2").addClass('active');

          $("#textbox").keydown(function(e){
            if ( e.which == 13 && !e.ctrlKey){ //enter
              var text = $(this).val();
              var ending = new Date().getTime();
              var sent_at = critique_start - time_start; //msec point in video where it starts
              var duration = ending - critique_start;
              add_critique_item_db(sent_at, duration, text, "comment");
              add_critique_item(sent_at, duration, text, "comment");
              $(this).val("");
            }else if(e.which == 8 || e.which==46) {//backspace/delete
              critique_start = new Date().getTime();
            }else if($(this).val().length == 0){//first character
              critique_start = new Date().getTime();
            } 
          });

          $(".submit").on("click",function(){
            //check which is active
            var type ="";
            if ($("#option1").hasClass('active')) {
              type = 'comp';
            } else if ($("#option2").hasClass('active')) {
              type = "comment";
            } else {
              type = 'suggest';
            }

            var ending = new Date().getTime();
            var text = $(this).val();
            var sent_at = critique_start - time_start; //msec point in video where it starts
            var duration = ending - critique_start;
            add_critique_item_db(sent_at, duration, text, type);
            add_critique_item(sent_at, duration, text, type);
            $(':input[id="textbox"]').val(null);
            $(this).val("");
          });

          $(".cancel").on("click",function(){
            $(this).val("");
            //also close the div
            $(':input[id="textbox"]').val(null);
          });

       //   $("#critique-panel").show();

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

    time_start = new Date().getTime();
    currently_recording = true;

    if(if_musician){
      window.recordRTC_Video.startRecording();
      window.recordRTC_Audio.startRecording(); 
      var timeElapsed = 0;

      // //redraw the critique timeline every 0.5 seconds
      // setInterval( function(){
      //   if (currently_recording)
      //   timeElapsed += 500 ;
      //   if (timeElapsed > 10000){
      //     timeline.setOptions({
      //       end:timeElapsed
      //     });
      //   }
      // },500);

    } else { //critiquer
      window.musician_video_stream.startRecording();
      window.musician_audio_stream.startRecording();

      //redraw the critique timeline every 0.5 seconds
      setInterval( function(){
        var now = new Date().getTime();
        if (currently_recording){
          var timeElapsed = now - time_start;
          if (timeElapsed > 10000){
            timeline.setOptions({end:zeroTime.getTime()+timeElapsed});
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
  }

  var control = !if_musician;
  

  //called when session begins
  function begin_critique_session(){
    $('#text-entry').fadeOut();
    $('#settings').show();
    $(".memo").hide();
    show_critique_items();
    var critique_audio = document.getElementById('critique_audio');
    var critique_video = document.getElementById('critique_video');

    if(if_musician){

      // musician's video will move based on what the critiquer did
      critique_video.addEventListener('loadedmetadata', function() {   
          practice_session.child('critique_video_time').on('value', function(snapshot){
            
            if(snapshot.val()){    
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

      //when you click, it will take you to that place in the video
      //IDs are zero indexed of the item list
      //TRAVIS!
      //Right now it's only set so that the critiquer can click on things and jump 
      //places in the video since there's only one event listener. If we're going to 
      //toggle it, could you implement it?
      timeline.on('select', function (properties) {
        var itemIndex = properties.items[0];
        var targetItem = critiqueItems[itemIndex];
        var startDisplace = targetItem.start - zeroTime.getTime();//displace from start in msec
        
        //set new time for critiquer video in seconds
        critique_video.currentTime = startDisplace/1000;

      });
    }
    //make the dictionary for jumping to places
    render_critique();

  }

  function makeMusicianTimeline(){
    if (if_musician){
      timeline.setOptions({
        end: zeroTime.getTime()+recordDuration
      });
    }
  }
  //renders the critique for critique session
  function render_critique(){

    makeMusicianTimeline();

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
        // var scroll_to = $("#critique_at_"+time);
        // scroll_to.className = 'active_critique';
        // $("#critiques").animate({
        //   scrollTop: scroll_to.offset().top - container.offset().top + container.scrollTop()
        // });
        $("#active_critique").html(critiques[time]);
      }
    },500);

    //show the thing
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
      type: 'rangeoverflow',
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