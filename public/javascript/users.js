(function() {

  var fb_instance;
  var auth;

$(document).ready(function() {
    initialize_app();

    $("#login_user").on("click", function() {
      var email = $("#login_email").val();
      var password = $("#login_password").val();
      auth.login('password', {
        email: email,
        password: password,
        rememberMe: true
      });
    });

    $("#register_user").on("click", function() {
      if($("#reg_password").val() == $("#reg_password_conf").val()){
          console.log("in here");
          var email = $("#reg_email").val();
          var password = $("#reg_password").val();
          auth.createUser(email, password, function(error, user){
            if(!error){
              fb_instance.child('users').child(user.id).set({user_name: email, created_at: now});
              auth.login('password',{
                email: email,
                password: password,
                rememberMe: true
              });
            } else {
              alert(error);
            }
          });
      } else {
        alert("Passwords do not match!");
      }
    });
})

function initialize_app(){
     fb_instance = new Firebase("https://makikofp3.firebaseIO.com");
     auth = new FirebaseSimpleLogin(fb_instance, function(error, user) {
        if (error) {
          // an error occurred while attempting login
          console.log("messed up");
        } else if (user) {
          var now = new Date().getTime();

          fb_instance.child('online_users').child(user.id).set({user_id: user.id});
          fb_instance.child('users').child(user.id).update({last_login: now});
          var redirect = "http://localhost:3000/home";
          window.location.replace(redirect);

        } else {
          //user is not logged in
        }
      });
  }
})();
