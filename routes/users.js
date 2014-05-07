
exports.show = function(req, res) {
	var Firebase = req.app.locals.Firebase;
	var fb_instance = new req.app.Firebase("https://sizzling-fire-6665.firebaseio.com");

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

    res.render('users/home',{
        title: 'Home'
    });
}

exports.index = function(req, res){
	res.render('index', {title:"Musique"});
}