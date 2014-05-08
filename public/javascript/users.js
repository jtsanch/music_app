//used only for login/register pages
$(document).ready(function() {
    
  fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com/");
  auth = new FirebaseSimpleLogin(fb_instance, function(error, user) {
    if (error) {
      // an error occurred while attempting login
    } else if (user) {
      //user is logged in, redirect
      var now = new Date().getTime();
      fb_instance.child('online_users').child(user.id).set({user_id: user.id});
      fb_instance.child('users').child(user.id).update({active_time: now});
      var redirect = "/home";
      window.location.replace(redirect);
    } else {
      //logged out
    }
  });

    /* Login page js */
    $("#login_user").on("click", function() {
      var email = $("#login_email").val();
      var password = $("#login_password").val();
      auth.login('password', {
        email: email,
        password: password,
        rememberMe: true
      });
    });

    /* end Login Page js */

    /* begin Register Page js */
    $("#register_user").on("click", function() {
      if($("#reg_password").val() == $("#reg_password_conf").val()){
          var email = $("#reg_email").val();
          var password = $("#reg_password").val();
          var userName = $("#reg_userName").val();
          auth.createUser(email, password, function(error, user){
            if(!error){
              var now = new Date().getTime();
              var peer_id = Math.random().toString(36).substring(7);;
              fb_instance.child('users').child(user.id).set({user_name: userName, created_at: now, peer_id: peer_id, email: email });
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
    // if(current_user){
    //   /* begin Profile Page js */
    //   $("#call_user").on("click", function() {
    //     var musician_id = $("#musician_id");
    //     fb_instance.child("practice_sessions").child("count").on("value", function(snapshot){
    //       if(snapshot.val()){
    //         var session = fb_instance.child("practice_sessions").child(snapshot.val()+1);
    //         session.child('users').put({musician_id: musician_id, critiquer_id: current_user.id});
    //         var redirect = window.location.href.split(".com")[0]+".com/practice_session/"+snapshot.val()+1+"/false";
    //         window.location.replace(redirect);
    //       } else {
    //         var redirect = window.location.href.split(".com")[0]+".com/error"+;
    //         window.location.replace(redirect);
    //       }
    //     });
    //     fb_instance.child("practice_sessions");
    //   }); 
    // }
});
