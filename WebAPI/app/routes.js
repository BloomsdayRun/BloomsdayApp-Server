module.exports = function(app, passport, connection) {
    //TODO: Open-close MySQL connection on demand
    //TODO: Enhance security with app-secret proof
    //TODO: Rewrite routes to scale (can't do more than ~600 graph requests per second)

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
        response.render("index.ejs", function(err, html) {
            response.send(html);
        });
    });

    //MARK: RESTful API routes
    //Route different requests to different dbms actions
    //GET runner data (spectator)
    app.get( '/api/runner/', function(request, response) {
        // var id = request.params.id;
        var id = request.query.id;
        // console.log(id);
        //TODO: What is the overhead of reloading graph for each request?
        // ^ If this becomes a problem, look into FB's Javascript API
        var graph = require('fbgraph');
        var accessToken = request.get("access-token");
        if (accessToken) graph.setAccessToken(accessToken);

        graph.get("me/friends/" + id, function(err, res) {
            //Check if user is friends with id by seeing if query is non-empty
            //TODO: Find a more robust way to do this
            var data = res.data;
            if (err) {
                response.send("ERROR::FBAUTH error on get");
            } else if (data && data[0]) {
                var tokenId = console.log(res.data[0].id);
                var query = "SELECT * from Runner where RunnerID = " + id + ";";

                connection.query(query, function(err, rows, fields) {
                    if (err) {
                        //TODO: Don't send error message to client in production
                        response.send("error retrieving from database: " + err);
                        // throw err; //throwing shuts down server
                    } else {
                        if (rows[0]) { //i.e., if the response is not null/undefined
                            console.log('RESPONSE:: ', rows[0]);
                            response.send(rows[0]);     
                        } else {
                            response.send("ERROR::DBMS attempt to access user with no defined location");     
                        }
                    }
                });                
            } else {
                //they must not be friends
                response.send("ERROR::Get non-friend or nonexistent user");
            }

        });

    });

    // POST runner data (runner)
    app.post( '/api/runner/', function(request, response) {
        // console.log(request.headers);
        // TODO: May need to extend token lifespan
        console.log(request.get("access-token"));
        var graph = require('fbgraph');
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
            if (!err) {
                //TODO: There's probably a library for autoformatting SQL queries
                var query = 
                    "INSERT INTO Runner (RunnerId, Latitude, Longitude, TimeStamp) VALUES ('" 
                    + tokenId + "', '" + latitude + "', '" + longitude + "', '" + timestamp + "') ON DUPLICATE KEY UPDATE Latitude=VALUES(Latitude), Longitude=VALUES(Longitude), Timestamp=VALUES(Timestamp);";

                console.log(query);
                connection.query(query, function(err, rows, fields) {
                    if (err) {
                        response.send("ERROR::DBMS error when posting::" + err);
                        // throw err; //TODO: Don't shutdown server on error
                    } else {
                        response.send("SUCCESS::Inserted data to table");
                    }
                });
            } else {
                console.log("ERROR::FBAUTH error when posting");
                response.send("ERROR::FBAUTH error when posting");
            }

        });  

    });

}
