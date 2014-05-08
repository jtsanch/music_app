exports.show = function(req, res) {
	var Firebase = req.app.locals.Firebase;
	var fb_instance = new req.app.Firebase("https://sizzling-fire-6665.firebaseio.com");

	var critiquer_id = req.params.critiquer_id;
	var user = fb_instance.child('users').child(user_id);
	
	user.on('value', function(snapshot){
		if(snapshot.val()){
			res.render('users/show', {
		        title: snapshot.val().name,
		        user: snapshot.val()
	    	});
		} else {
			res.render('users/show', {
				title: "User doesn't exist!",
				user: {name:"I don't exist", id:"-1"}
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
            console.log("rendering");
            console.log(onlineUsers);
            res.render('users/home',{
                title: 'Home',
                onlineUsers: onlineUsers
            });
        }
        else
        {
                setTimeout(checkCount,100);
        }
    } 
    checkCount();
}
