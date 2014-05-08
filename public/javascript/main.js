var current_user;
var fb_instance;
var online_users;
var auth;

(function() {


$(document).ready(function() {
    fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com/");

    initPage();
    login_user();
  
    $("#logout").on("click", function(){
      logout();  
    });

     /* begin Profile Page js */
    $("#invite_asM").on("click", function(){
      if(current_user){
        var request_id = current_user.id;
        var invited_id = $("#clicked_user").val();
        //Make sure to ping the clicked_user
        var pushRef = fb_instance.child("practice_sessions").push();
        pushRef.set({musician_id: request_id, critiquer_id: invited_id});
        fb_instance.child('users').child(invited_id).child('ping').set(pushRef.name());
        var redirect = "/practice/" + pushRef.name() + "/true";
        window.location.replace(redirect);
      }
    });
    $(".user_thumbs").on('click', function(){
      $("#clicked_user").val($(this).attr('id'));
    })
    $("#profile_link").on("click", function(){
      var user_id = $("#clicked_user").val();
      window.location.replace("/users/"+user_id);
    });

    //If there is a user, and if this user is being pinged, display the invite prompt
    if(current_user){ 
      fb_instance.child("users").child(current_user.id).on('child_changed', function(snapshot){
        if(snapshot.val()){
          var session_id = snapshot.val();
          show_invite_prompt(session_id);          
        }
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

function show_invite_prompt(session_id){
  //toggle receiving call prompt here
  
  //end receving call prompt here
  $("#invite_accepted").on("click", function(){
        var redirect = "/practice_session/"+session_id+"/false";
        window.location.replace(redirect);
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
          window.localStorage.removeItem("user");
    }

   });
   auth.logout();  
}

function login_user(){
    $("container").hide();
    if (!window.localStorage["user"]){
       fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com/");

       auth = new FirebaseSimpleLogin(fb_instance, function(error, user) {
         console.log(user);
          if (error) {
            // an error occurred while attempting login

          } else if (user) {
            //user is logged in
             fb_instance.child("users").child(user.id).on("value", function(snapshot){
                window.localStorage.setItem("user", JSON.stringify(snapshot.val()));
                current_user = JSON.parse(window.localStorage["user"]);
                begin_app(); 
             });
            }else{
              //error, logout
              logout();
            }
        });
     }else{
      current_user = JSON.parse(window.localStorage["user"]);
      begin_app();
     } 

    }

function begin_app(){
   $("#username").text(current_user.name); 
   $("#logging_in").hide();
   $(".container").show();
}

})();

