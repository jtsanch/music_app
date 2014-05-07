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

    res.render('users/home',{
        title: 'Home'
    });
}

exports.index = function(req, res){
	res.render('index', {title:"Musique"});
}