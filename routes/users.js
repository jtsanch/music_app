exports.show = function(req, res) {
	var Firebase = req.app.locals.Firebase;
	var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");

	var user_id = req.params.id;
	var user = fb_instance.child('users').child(user_id);
	
	user.on('value', function(snapshot){
		if(snapshot.val()){
			res.render('users/show', {
		        title: snapshot.val().name,
		        user: snapshot.val()
	    	});
		} else {
			res.render('users/show', {
				title: "Profile",
				user: {name:"MyName", id:"-1"}
			});
		}
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
    var onlineUsers=[];
    var count=0;
    var lengthUser=-1;
    var Firebase = req.app.locals.Firebase;
    var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");
    fb_instance.child('online_users').once('value', function(userSnap) {
        lengthUser = Object.keys(userSnap.val()).length;
        for (user in userSnap.val()){
            fb_instance.child('users/'+user).once('value', function(mediaSnap) {
                onlineUsers.push(mediaSnap.val());
                count += 1;
            });
        }
    });

    function checkCount()
    {
        if ( count==lengthUser)
        {
            res.render('users/home',{
                title: 'Home',
                onlineUsers: onlineUsers,
                user_id: 10
            });
        }
        else
        {
                setTimeout(checkCount,100);
        }
    } 
    checkCount();
}
