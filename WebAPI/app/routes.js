module.exports = function(app, passport, connection) {

    // MARK: Facebook routs
    app.get('/auth/facebook', passport.authenticate('facebook', 
        { scope : 'email',
          session : false
         }
        )
    );

    //Success/fail options upon Facebook auth
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/testSuccess',
            failureRedirect : '/'
        }));

    app.get("/testSuccess", function(request, response) {
        response.send("Great success logging in");
    });

    //home page
    app.get( '/', function(request, response) {
        response.render("index.ejs");
    });

    //MARK: RESTful API routes
    //Route different requests to different dbms actions
    //GET runner data (spectator)
    app.get( '/api/runner/', function(request, response) {
        // var id = request.params.id;
        // console.log(id);
        var id = request.query.id;
        var query = "SELECT * from Runner where RunnerID = " + id + ";";

        connection.query(query, function(err, rows, fields) {
            if (err) {
                //TODO: Don't send error message to client in production
                response.send("error retrieving from database: " + err);
                // throw err; //throwing shuts down server
            } else {
                if (rows[0]) { //i.e., if the response is not null/undefined
                    console.log('Response: ', rows[0]);
                    response.send(rows[0]);     
                } else {
                    response.send("No such user!");     
                }
            }
        });
    });

    // POST runner data (runner)
    app.post( '/api/runner/', function(request, response) {
        // console.log(request.query.id);
        // console.log(request.query.position);
        var id = request.query.id;
        var latitude = request.query.latitude;
        var longitude = request.query.longitude;
        var timestamp = request.query.timestamp;
        //TODO: There's probably a library for autoformatting SQL queries
        //TODO: If this RunnerID already exists, alter, don't create a new row
        var query = 
            "INSERT INTO Runner (RunnerId, Latitude, Longitude, TimeStamp) VALUES ('" 
            + id + "', '" + latitude + "', '" + longitude + "', '" + timestamp + "');";
        console.log(query);
        connection.query(query, function(err, rows, fields) {
            if (err) {
                response.send("error inserting into database: " + err);
                // throw err; //TODO: Don't shutdown server on error
            } else {
                response.send("Insertion should be successful");
            }
        });
    });

}
