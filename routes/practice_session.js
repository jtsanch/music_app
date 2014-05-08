
exports.show = function(req, res) {

    var fb_instance = new req.app.locals.Firebase("https://sizzling-fire-6665.firebaseio.com");
 

    var session_id = req.params.session_id;
    var if_musician = req.params.if_musician;
    fb_instance.child('practice_sessions').child(session_id).on("value", function(snapshot){
        if(snapshot.val()){
            res.render('practice/show', {
                title: "My Practice Session",
                session_id : session_id,
                if_musician : if_musician
            });
        } else {
            res.render('error_page',{
                error: "Practice session does not exist!"
            });
        }
    });
}