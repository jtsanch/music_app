
exports.show = function(req, res) {

    var fb_instance = new req.app.locals.Firebase("https://sizzling-fire-6665.firebaseio.com");
 

    var session_id = req.params.session_id;
    //if_musician has to be a boolean, but the param is string
    var if_musician;
    if (req.params.if_musician==='true'){
        if_musician = true;
    }else{
        if_musician = false;
    }
    var practice_start = req.params.practice_start;
    var practice_end = req.params.practice_end;
    fb_instance.child('practice_sessions').child(session_id).on("value", function(snapshot){
        if(snapshot.val()){
            res.render('practice/show', {
                title: "My Practice Session",
                session : snapshot.val(),
                session_id : session_id,
                if_musician : if_musician
            });
        } else {
            console.log(session_id);
            res.render('error_page',{
                error: "Practice session does not exist!"
            });
        }
    });
}