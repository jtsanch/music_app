exports.index = function(req, res){
	res.render('index', {
		'onlineUsers': [
			{	'name': 'Sapna',
				'image':'sapna.jpg',
				'profile': '/users/2',
				'instrument': 'piano'
			},
			{	'name': 'Makiko',
				'image':'makiko.jpg',
				'profile': '/users/1',
				'instrument': 'guitar'
			}

		]
	});
}