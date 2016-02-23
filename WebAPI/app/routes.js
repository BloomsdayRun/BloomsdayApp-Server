/*
Routes for API. The parameters are: 
POST (your location)
    id (optional)
    latitude
    longitude
    timestamp
GET (location of friend)
    id
*/
var constants = require("../config/constants");
module.exports = function(app) {
    //TODO: Enhance security with app-secret proof
    //TODO: Consistent logging
    //TODO: Ensure caching works (can't do more than ~600 graph requests per second)

    //home page
    app.get( '/', function(request, response) {
        response.render("index.ejs", function(err, html) {
            response.send(html);
        });
    });

    //MARK: RESTful API routes
    //Route different requests to different dbms actions
    //GET runner data (spectator)
    // TODO: Validate URL params on requests prior to anything else
    app.get( '/api/runner/', function(request, response) {
        var accessToken = request.get("access-token");
        if (!validateGet(accessToken, request.query.id)) {
            response.send("Invalid token or params");
        } else {
            var get = function(target) {
                var msg = getFromDatabase(target, function(msg) {
                    response.send(msg);
                });
            };

            checkTokenCache(accessToken, function(followerId) {
                canFollow(followerId, request.query.id, function(cached) {
                    if (cached) {
                        get(request.query.id);
                    } else {
                        // Check for friendship and update cache
                        var graph = require('fbgraph');
                        if (accessToken) graph.setAccessToken(accessToken);
                        graph.get("me/friends/" + request.query.id, function(err, graphRes) {
                            //Check if user is friends with id by seeing if query is non-empty
                            //TODO: Find a more robust way to do this
                            if (err) {
                                response.send("ERROR::FBAUTH error on get (expired token?)");
                            } else if (graphRes && graphRes.data && graphRes.data[0]) { 
                                // graphRes not null -> response from Facebook
                                // graphRes.data not null -> response is nonempty (access token valid)
                                // graphRes.data[0] not null -> users are friends
                                updateCanFollow(followerId, graphRes.data[0].id);
                                get(graphRes.data[0].id);
                            } else {
                                //they must not be friends
                                response.send("ERROR::Get non-friend or nonexistent user "
                                    + JSON.stringify(graphRes));
                            }
                        });                    
                    }
                });
            },
            function(err) {
                response.send(err);
            });            
        }
    });

    // POST runner data (runner)
    app.post( '/api/runner/', function(request, response) {
        var accessToken = request.get("access-token");
        if (!validatePost(accessToken, request.query.latitude, 
          request.query.longitude, request.query.timestamp)) {
            response.send("Invalid token or params");
        } else {
            var post = function(id) {
                postToDatabase(id,
                    request.query.latitude,
                    request.query.longitude,
                    request.query.timestamp, function(msg) {
                        response.send(msg);
                    });  
            } 

            checkTokenCache(accessToken, function(id) {
                post(id);
            },
            function(err) {
                response.send(err);
            });  
        }   
    });            
}

//MARK: Request parameter validation
var validateGet = function(accessToken, id) {
    if (accessToken && id) {
        return (!(isNaN(id)) && accessToken.split(" ").length == 1);
    } else {
        return false;
    }
}

var validatePost = function(accessToken, latitude, longitude, timestamp) {
    if (accessToken && latitude && longitude && timestamp) {
        return (!(isNaN(latitude)) && !(isNaN(longitude)) &&
            !isNaN(timestamp) && accessToken.split(" ").length == 1);
    } else {
        return false;
    }    
}

var squel = require("squel").useFlavour('mysql');
var pool = require("../config/connection.js");

//MARK: Caching functions
var checkTokenCache = function(token, success, fail) {
    var query = squel
        .select().from("TokenCache").where("Token = '" + token + "'").toString() + ";";
    console.log(query);
    execQuery(query, function(err, rows, fields) {
        if (err) {
            console.log("ERROR::SQL Output " + err);
            fail("ERROR::Retrieving cached ID");
        } else if (rows.length == 0 || rows.length > 1) { 
            //T does not exist; or T exists multiple times
            if (rows.length > 1) {
                //drop all duplicates
                var dquery = squel
                    .delete().from("TokenCache").where("Token = " + token)
                    .toString() + ";";
                execQuery(dquery, function(err, rows, fields) {
                    console.log("Delete duplicated token");
                });
            }
            // Due to async queries, might update TokenCache with FBGRAPH info,
            // then delete duplicate entries (wasteful, but duplicates very unlikely)
            console.log("No such cached token");
            var graph = require('fbgraph');
            graph.get("debug_token?input_token=" + token 
              + "&access_token=" + constants.facebookAuth.clientID 
              + "|" + constants.facebookAuth.clientSecret, function(fberr, res) {
                if (fberr) {
                    fail("ERROR: FBERROR " + JSON.stringify(fberr) );
                } else if (res.data.error) {
                    fail("ERROR: FBERROR " + res.data.error.message);
                } else {
                    var tokenId = res.data.user_id;
                    var expiry = res.data.expires_at;
                    console.log(tokenId + " - " + expiry);
                    updateTokenCache(tokenId, token, expiry);
                    success(tokenId);        
                }
            });      
        } else { //T does exist
            cached = rows[0];
            console.log("Retrieve cached token: ", cached);
            var now = new Date().getTime();
            if (now > cached.expiry) {
                //TODO: Maybe token expires for User A, and Facebook reissues token to B
                // (could fix client side - ask for new token if getting expired message)
                fail("ERROR::Your token expired at " + cached.expiry); 
            } else {
                success(cached.RunnerID);
            }
        }    
    });
}

var canFollow = function(followerID, followedID, next) {
    //Could INSERT INTO CanFollow (followerID, followerID) for reflexivity
    if (followerID === followedID) {
        next(true); 
    } else {
        var query = squel
            .select().from("CanFollow").where("FollowerID = " + followerID)
            .where("FollowedID = " + followedID)
            .toString() + ";";
        console.log(query);
        execQuery(query, function(err, rows, fields) {
            if (err) next(false);
            if (!rows) next(false);
            console.log(rows);
            next(rows.length == 1);
        });
    }
}

var updateCanFollow = function(followerID, followedID) {
    var query = squel
        .insert()
        .into("CanFollow")
        .set("FollowerID", followerID)
        .set("FollowedID", followedID)
        .toString() + ";";
    execQuery(query, function(err, rows, fields) {
        console.log("Update CanFollow: " + followerID + " - " + followedID);
    });    
}

var updateTokenCache = function(id, token, expiry) {
    var query = squel
        .insert()
        .into("TokenCache")
        .set("RunnerID", id)
        .set("Token", token)
        .set("Expiry", expiry)
        .onDupUpdate("Token", token)
        .onDupUpdate("Expiry", expiry)
        .toString() + ";";
    execQuery(query, function(err, rows, fields) {
        console.log("Update token cache: " + id + " - " + token);
    });
};

//MARK: Format RESTful params into SQL queries and send back response
var getFromDatabase = function(id, out) {
    var query = squel
        .select()
        .from("Runner")
        .where("RunnerID = " + id)
        .toString() + ";";
    console.log(query);

    execQuery(query, function(err, rows, fields) {
        if (err) {
            //TODO: More consistent error messages
            out("ERROR::SQL Output " + err);
            // throw err; //throwing shuts down server
        } else {
            if (rows[0]) { //i.e., if the response is not null/undefined
                console.log('Retrieved ', rows[0]);     
                out(rows[0]);
            } else {
                out("ERROR::DBMS attempt to access user with no defined location");
            }
        }
    });
}

var postToDatabase = function(id, latitude, longitude, timestamp, out) {
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
    execQuery(query, function(err, rows, fields) {
        if (err) {
            out("ERROR::DBMS error when posting::" + err);
        } else {
            out("POST_SUCCESS");
        }
    });
}

// Get a connection from the pool, and call callback upon query
var execQuery = function(query, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            //TODO: Better error handling here
            console.log("Error in connection pool");
        } else {
            connection.query(query, function(err, rows, fields) {
                callback(err, rows, fields);
            });
            connection.release();            
        }
    });    
}
