exports.show = function(req, res) {
	var user_id = req.params.id;

    res.render('users/show', {
        title: "User name"
    });
}

exports.edit = function(req, res) {
	var user_id = req.params.id;
	res.render('users/edit',{
		title: 'Edit Profile'
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
