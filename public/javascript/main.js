  (function() {

  var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com/");
  var online_users;
  var current_user;
  var current_id;
  var auth;

$(document).ready(function() {
    initPage();
    login_user();
  
    $("#logout").on("click", function(){
      logout();
    });

     /* begin Profile Page js */
    $("#invite_asM").on("click", function() {
      if(current_user){
        var request_id = current_id;
        var invited_id = $("#clicked_user").val();

        var pushRef = fb_instance.child("practice_sessions").push();
        pushRef.set({musician_id: request_id, critiquer_id: invited_id});
        var redirect = "/practice/" + pushRef.name() + "/false";
        window.location.replace(redirect);
      }
    });
  //      var redirect = "/practice_session/" + snapshot.val() + "/false";
  //      window.location.replace(redirect);
      //   fb_instance.child("practice_sessions").child("count").on("value", function(snapshot){
      //     if(snapshot.val()){
      //       var session = fb_instance.child("practice_sessions").child(snapshot.val()+1);
      //       //need to eventually change to have critiquers able to invite too
      //       session.child('users').put({musician_id: request_id, critiquer_id: invited_id});
      //       var redirect = "/practice_session/" + snapshot.val() + "/false";
      //       window.location.replace(redirect);
      //     } else {
      //       var redirect = "/error";
      //       window.location.replace(redirect);
      //     }
      //   });
      //   fb_instance.child("practice_sessions");
      // } else{
      //   console.log("error with inviting");
      // }

    $("#profile_link").on("click", function(){
      var user_id = $("#clicked_user").val();
      window.location.replace("/users/"+user_id);
    });

    //If there is a user, and if this user is being pinged, display the invite prompt
    if(current_id){ 
      fb_instance.child("users").child(current_id).child('ping').on('child_changed', function(snapshot){
        show_invite_prompt();
      });
    }
});

function initPage(){
  $("#login").hide();
  $("#logout").show();

  $(".user_thumbs").on("click", function(){
    //set hidden user id
    var user_id = $(this).attr('id');
    $("#clicked_user").val(user_id);
  });
}

function show_invite_prompt(){
  //toggle receiving call prompt here
  
  //end receving call prompt here
  $("#invite_accepted").on("click", function(){
    fb_instance.child("conversations").child("critiquer_id")
      .startAt(current_user.id)
      .endAt(current_user.id)
      .on('value', function(snapshot){
        if(snapshot.val()){
          var session_id = snapshot.val();
          var redirect = "/practice_session/"+session_id+"/false";
          window.location.replace(redirect);
        } else {
          var redirect = "/error";
          window.location.replace(redirect);
        }
      });
  });
}

function logout(){
   auth = new FirebaseSimpleLogin(fb_instance, function(error, user) {
    if (error){
      
    }else if (user){

    }else{
      //logout
             //user is has logged out
          fb_instance.child("online_users").child(current_id).remove();
          window.localStorage.removeItem("user_id");
          window.localStorage.removeItem("user_name");
          window.location.replace("/login");
    }

   });
   auth.logout();  
}

function login_user(){
    $("container").hide();
    if (!window.localStorage["user_id"]){
       fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com/");
       auth = new FirebaseSimpleLogin(fb_instance, function(error, user) {
          if (error) {
            // an error occurred while attempting login

          } else if (user) {
            //user is logged in
          fb_instance.child('users').child(user.id).on('value',function(snapshot){
              if(snapshot.val()){
                current_user = snapshot.val().user_name;
                current_id = snapshot.val().user_id;
                window.localStorage.setItem("user_id", snapshot.val().id);
                window.localStorage.setItem("user_name", current_user);
                begin_app();
              }else{
                //error, logout
                logout();
              }
            });
        } else {
          //logged out
        }
      });
     }else{
      current_user = window.localStorage["user_name"];
      current_id = window.localStorage["user_id"];
      begin_app();
     } 

    }

function begin_app(){
   $("#username").text(current_user); 
   $("#logging_in").hide();
   $(".container").show();
}

})();

