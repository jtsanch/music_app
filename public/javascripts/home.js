(function() {

  var fb_instance;
  var online_users;
  var current_user;
  var current_id;
  var auth;

$(document).ready(function() {
    initPage();
    login_user();
  
  $("#logout").on("click", function(){
    logout();
    window.location.replace("/login");
  });

});

function initPage(){
  $("#login").hide();
  $("#logout").show();
}

function logout(){
   fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");
   auth = new FirebaseSimpleLogin(fb_instance, function(error, user) {
    if (error){

    }else if (user){

    }else{
      //logout
        fb_instance.child("online_users").child(current_id).remove();
          window.localStorage.removeItem("user_id");
          window.localStorage.removeItem("user_name");
    }

   });
   auth.logout();  
}

function login_user(){
    $(".container").hide();
    if (!window.localStorage["user_id"]){
       fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");
       auth = new FirebaseSimpleLogin(fb_instance, function(error, user) {
          if (error) {
            // an error occurred while attempting login

          } else if (user) {
            //user is logged in
          fb_instance.child('users').child(user.id).on('value',function(snapshot){
              if(snapshot.val()){
                current_user = snapshot.val().user_name;
                current_id = snapshot.val().user_id;
                window.localStorage.setItem("user_id", current_id);
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
