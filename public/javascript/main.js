(function() {

  var fb_instance;
  var online_users;
  var current_user;
  var auth;

$(document).ready(function() {
    login_user();
  
    $("#logout").on("click", function(){
      logout();
    });
    if(current_user){ 
      fb_instance.child("users").child(current_user).child('ping').on('child_changed', function(snapshot){
        show_invite_prompt();
      });
    }
});

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
          var redirect = "http://localhost:3000/practice_session/"+session_id+"/false";
          window.location.replace(redirect);
        } else {
          var redirect = "http://localhost:3000/error";
          window.location.replace(redirect);
        }
      });
  });
}
function logout(){
   fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com/");
   auth = new FirebaseSimpleLogin(fb_instance, function(error, user) {
    if (error){
      
    }else if (user){

    }else{
      //logout
             //user is has logged out
          window.localStorage.removeItem("user_id");
          window.localStorage.removeItem("user_name");
          fb_instance.child('online_users').child(1).set(null);
          console.log("here");
          window.location.replace("/login");
    }

   });
   auth.logout();  
}

function login_user(){
    $("body").hide();
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
      begin_app();
     } 

    }

function begin_app(){
   $("#username").text(current_user); 
   $("body").show();
}

})();
