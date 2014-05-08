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
      var redirect = "http://localhost:3000/home";
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

    if(current_user){
      /* begin Profile Page js */
      $("#call_user").on("click", function() {
        var musician_id = $("#musician_id");
        fb_instance.child("practice_sessions").child("count").on("value", function(snapshot){
          if(snapshot.val()){
            var session = fb_instance.child("practice_sessions").child(snapshot.val());
            session.child('users').put({musician_id: musician_id, critiquer_id: current_user.id});
            var redirect = "http://localhost:3000/practice_session/" + musician_id + "/false";
            window.location.replace(redirect);
          } else {
            var redirect = "http://localhost:3000/error";
            window.location.replace(redirect);
          }
        });
        fb_instance.child("practice_sessions");
      }); 


    }
});