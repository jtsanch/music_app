//used only for login/register pages
$(document).ready(function() {
    
    /* Login page js */
    $("#login_user").on("click", function() {
      var email = $("#login_email").val();
      var password = $("#login_password").val();
      auth.login('password', {
        email: email,
        password: password,
        rememberMe: true
      });
      var now = new Date().getTime();
      fb_instance.child('online_users').child(user.id).set({user_id: user.id});
      fb_instance.child('users').child(user.id).update({active_time: now});
      var redirect = "/home";
      window.location.replace(redirect);
    });

    /* end Login Page js */

    /* begin Register Page js */
    $("#register_user").on("click", function() {
      if($("#reg_password").val() == $("#reg_password_conf").val()){
          console.log("in here");
          var email = $("#reg_email").val();
          var password = $("#reg_password").val();
          auth.createUser(email, password, function(error, user){
            if(!error){
              var now = new Date().getTime();
              var peer_id = Math.random().toString(36).substring(7);;
              fb_instance.child('users').child(user.id).set({user_name: email, created_at: now, peer_id: peer_id });
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
    /* end Register Page js */

    }
});
