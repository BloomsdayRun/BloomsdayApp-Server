module.exports = function(app, passport, connection) {
    //TODO: Enhance security with app-secret proof
    var graph = require('fbgraph');

    // MARK: Facebook routes
    app.get('/auth/facebook', passport.authenticate('facebook', 
        // Scope determines permissions associated with token
        { scope: ['email', 'user_friends'],
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
        //TODO: There may be a race condition with a global graph object
        var accessToken = request.get("access-token");
        graph.setAccessToken(accessToken);

        graph.get("me/friends/" + id, function(err, res) {
            //Check if user is friends with id by seeing if query is non-empty
            //TODO: Find a more robust way to do this
            var data = res.data;
            if (data) {
                var tokenId = console.log(res.data[0].id);
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
            } else {
                //they must not be friends
                response.send("Unauthorized or nonexistent user");
            }

        });

    });

    // POST runner data (runner)
    app.post( '/api/runner/', function(request, response) {
        // console.log(request.headers);
        // TODO: May need to extend token lifespan
        console.log(request.get("access-token"));
        var accessToken = request.get("access-token");
        graph.setAccessToken(accessToken);
        graph.get("me?fields=id,name,friends", function(err, res) {
            console.log(res);
            var tokenId = res.id;
            console.log(tokenId);

            var id = request.query.id; //TODO: Compare id =?= tokenId
            var latitude = request.query.latitude;
            var longitude = request.query.longitude;
            var timestamp = request.query.timestamp;
            //TODO: There's probably a library for autoformatting SQL queries
            var query = 
                "INSERT INTO Runner (RunnerId, Latitude, Longitude, TimeStamp) VALUES ('" 
                + tokenId + "', '" + latitude + "', '" + longitude + "', '" + timestamp + "') ON DUPLICATE KEY UPDATE Latitude=VALUES(Latitude), Longitude=VALUES(Longitude), Timestamp=VALUES(Timestamp);";

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

    });

}
