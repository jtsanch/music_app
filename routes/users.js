exports.show = function(req, res) {
	var user_id = req.params.id;

    res.render('users/users', {
        title: "User name",
        user_id: user_id
    });
}

exports.login = function(req, res) {

	res.render('users/login',{
		title: 'Login'
	});

}

exports.register = function(req, res){
	var user_id = req.params.id;

	res.render('users/register',{
		title: 'Register'
	});
}

exports.home = function(req, res){
    var fb_instance = new req.app.Firebase("http://sizzling-fire-6665.firebase.com");
    fb_instance.child('online_users').child(user.id).on('value',function(snapshot){
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


    res.render('users/home',{
        title: 'Home',
        onlineUsers: onlineUsers
    });
}

exports.index = function(req, res){
	res.render('index', {title:"Musique"});
}