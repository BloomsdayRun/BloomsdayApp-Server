var squel = require("squel").useFlavour('mysql');

//MARK: Format RESTful params into SQL queries and send back response
var getFromDatabase = function(data, id, response) {
    var tokenId = data[0].id;
    console.log("Tid: " + tokenId);
    //TODO: Assert id == tokenId
    var query = squel
        .select()
        .from("Runner")
        .where("RunnerID = " + tokenId)
        .toString() + ";";
    console.log(query);

    var pool = require("../config/connection.js");
    pool.getConnection(function(err, connection) {
        //TODO: Check for error with pool
        connection.query(query, function(err, rows, fields) {
            if (err) {
                //TODO: More consistent error messages
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
        connection.release();
    });
}

var postToDatabase = function(id, latitude, longitude, timestamp, response) {
    var query = squel
        .insert()
        .into("Runner")
        .set("RunnerID", id)
        .set("Latitude", latitude)
        .set("Longitude", longitude)
        .set("TimeStamp", timestamp)
        .onDupUpdate("Latitude", latitude)
        .onDupUpdate("Longitude", longitude)
        .onDupUpdate("TimeStamp", timestamp)
        .toString() + ";";

    console.log(query);
    var pool = require("../config/connection.js");
    pool.getConnection(function(err, connection) {
        //TODO: Check for error with pool
        connection.query(query, function(err, rows, fields) {
            if (err) {
                response.send("ERROR::DBMS error when posting::" + err);
                // throw err; //TODO: Don't shutdown server on error
            } else {
                response.send("SUCCESS::Inserted data to table");
            }
        });
        connection.release();
    });
}



module.exports = function(app, passport) {
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

        graph.get("me/friends/" + id, function(err, graphRes) {
            //Check if user is friends with id by seeing if query is non-empty
            //TODO: Find a more robust way to do this
            // var data = graphRes.data;
            if (err) {
                response.send("ERROR::FBAUTH error on get");
            } else if (graphRes && graphRes.data && graphRes.data[0]) { 
            	// graphRes not null -> response from Facebook
            	// graphRes.data not null -> response is nonempty (access token valid)
            	// graphRes.data[0] not null -> users are friends
            	//if they are friends
                //TODO: getFromDatabase sends a response; would be more consistent
                //if gFD returns a string, and you send response below
                getFromDatabase(data, id, response);
            } else {
                //they must not be friends
                response.send("ERROR::Get non-friend or nonexistent user");
            }
        });
    });

    // POST runner data (runner)
    // TODO: Fix graph response bug in post (in event that server can't connect to FB)
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
            if (!err) {
                var id = request.query.id; //TODO: Compare id =?= tokenId
                var latitude = request.query.latitude;
                var longitude = request.query.longitude;
                var timestamp = request.query.timestamp;
                postToDatabase(id, latitude, longitude, timestamp, response);
            } else {
                console.log("ERROR::FBAUTH error when posting");
                response.send("ERROR::FBAUTH error when posting");
            }
        });  
    });

}
