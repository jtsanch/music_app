exports.show = function(req, res) {

    var practice_id = req.params.practice_id;
    var musician_id = req.params.musician_id;

    res.render('practice/show', {
        title: "Practice session title"
    });
}

exports.new = function(req, res) {

	//create new practice session and render new show view?
    res.render('practice/show', {
        title: "Practice session title"
    });
}