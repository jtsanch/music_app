exports.view = function(req, res){
	console.log('inside about.js');
  	res.render('help', {'appName':'SoundBoard'});
};