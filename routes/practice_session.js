
exports.show = function(req, res) {

    var fb_instance = new req.app.locals.Firebase("https://sizzling-fire-6665.firebaseio.com");
 

    var session_id = req.params.session_id;
    var if_musician = req.params.if_musician;
    var practice_start = req.params.practice_start;
    var practice_end = req.params.practice_end;
    fb_instance.child('practice_sessions').child(session_id).on("value", function(snapshot){
        if(snapshot.val()){
            var critiquer_id = snapshot.val()["critiquer_id"];
            var musician_id = snapshot.val()["musician_id"];
            res.render('practice/show', {
                title: "My Practice Session",
                session_id : session_id,
                if_musician : if_musician,
                critiquer_id : snapshot.val()["critiquer_id"],
                musician_id : snapshot.val()["musician_id"],
                is_recording : false,
                practice_start: practice_start,
                practice_end: practice_end
            });
        } else {
            res.render('error_page',{
                error: "Practice session does not exist!"
            });
        }
    });
}