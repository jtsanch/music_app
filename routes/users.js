exports.show = function(req, res) {
	var user_id = req.params.id;

    res.render('users/users', {
        title: "User name",
        user_id: user_id
    });
}

exports.edit = function(req, res) {
	var user_id = req.params.id;
	res.render('users/edit',{
		title: 'Edit Profile',
		user : user
	});
}

exports.login = function(req, res) {
	var user_id = req.params.id;

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

exports.index = function(req, res){
	res.render('index', {title:"Musique"});
}