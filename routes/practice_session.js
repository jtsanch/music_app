var Firebase = require('firebase');

var fb_instance = new Firebase("https://sizzling-fire-6665.firebaseio.com");

exports.show = function(req, res) {
	var critiquer_id = req.params.critiquer_id;
    var musician_id = req.params.musician_id;
    res.render('practice/show', {
        title: "Practice session title",
        critiquer_id: critiquer_id,
        musician_id: musician_id
    });
}

exports.new = function(req, res) {

	//create new practice session and render new show view?
    res.render('practice/show', {
        title: "Practice session title"
    });
}