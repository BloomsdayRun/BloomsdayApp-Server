/*
Routes for API. The parameters are: 
POST (your location)
    id (optional)
    latitude
    longitude
    timestamp
GET (location of friend)
    id

-> Cache friends and tokens because >600 graph requests per second is forbidden
-> Would be nice to enhance security with app-secret proof:
  https://developers.facebook.com/docs/graph-api/securing-requests
*/

// Position, tokencache, friendcache stored in memory
// ID -> Latitude, Longitude, Timestamp
var Runner = {};
// Runner[926211520805768] = {"Latitude": 37.32475605, "Longitude": -122.02254174, "Timestamp": 1459881707}; //testing only
// Token -> ID, Expiry
var TokenCache = {};
// FollowerID -> Set(FollowedID...)
// Assuming Set has O(1) lookups (TODO: Verify)
var Friends = {};


var constants = require("../config/constants");
module.exports = function(app) {

    //home page
    app.get( '/', function(request, response) {
        response.render("index.ejs", function(err, html) {
            response.send(html);
        });
    });

    //MARK: REST API routes
    //Route different requests to different dbms actions
    //GET runner data (spectator)
    app.get( '/api/runner/', function(request, response) {
        // console.log("Tkache", TokenCache);
        // console.log("Runner", Runner);
        // console.log("Friends", Friends);
        var accessToken = request.get("access-token");
        //Tag is client ip address & time request arrived
        var tag = "GET " + request.connection.remoteAddress + " " + Date.now() + " - "; 
        if (!validateGet(accessToken, request.query.id)) {
            // console.log(tag + "Invalid token or params");
            response.send("Invalid token or params");
        } else {
            var followerID = checkTokenCache(accessToken);
            // console.log(followerID);
            if (followerID) {
                areTheyFriends(followerID, request.query.id, accessToken, function(msg) {
                    // console.log(tag, msg);
                    response.send(msg);
                })
            } else {
                validateWithFacebook(accessToken, function(tokenId) {
                    if (!tokenId) {
                        response.send("ERROR::Token rejected by Facebook");
                    } else {
                        areTheyFriends(tokenId, request.query.id, accessToken, function(msg) {
                            console.log("Hey");
                            response.send(msg);
                        });
                    }
                })
            }
        }
    });

    // POST runner data (runner)
    app.post( '/api/runner/', function(request, response) {
        var accessToken = request.get("access-token");
        var tag = "POST " + request.connection.remoteAddress + " " + Date.now() + " - ";
        if (!validatePost(accessToken, request.query.latitude, 
          request.query.longitude, request.query.timestamp)) {
            // console.log(tag + "Invalid token or params");
            response.send("Invalid token or params");
        } else {
            var id = checkTokenCache(accessToken);
            if (id) {
                Runner[id] = {"Latitude": request.query.latitude, 
                  "Longitude": request.query.longitude,
                  "Timestamp": request.query.timestamp};
                // console.log(tag, "POST_SUCCESS");
                response.send("POST_SUCCESS");
            } else {
                validateWithFacebook(accessToken, function(tokenId) {
                    if (!tokenId) {
                        response.send("ERROR::Token rejected by Facebook")
                    } else {
                        Runner[tokenId] = {"Latitude": request.query.latitude, 
                          "Longitude": request.query.longitude,
                          "Timestamp": request.query.timestamp};
                        // console.log(tag, "POST_SUCCESS");
                        response.send("POST_SUCCESS");
                    }
                })
            }
        }   
    });            
}

var areTheyFriends = function(followerID, followedID, accessToken, next) {
    if (followerID == followedID) {
        next(runnerAsJSON(followedID));
        return;
    }
    //If follower has no entries in Friends cache, create a new one
    if (!Friends[followerID]) {
        Friends[followerID] = new Set();
    }
    if (Friends[followerID].has(followedID)) {
        next(runnerAsJSON(followedID));
    } else {
        // Check for friendship and update cache
        var graph = require('fbgraph');
        if (accessToken) graph.setAccessToken(accessToken);
        graph.get("me/friends/" + followedID, function(err, graphRes) {
            //Check if user is friends with id by seeing if query is non-empty
            //TODO: Find a more robust way to do this
            if (err) {
                next("ERROR::FBAUTH error on get (expired token?)");
            } else if (graphRes && graphRes.data && graphRes.data[0]) { 
                // graphRes not null -> response from Facebook
                // graphRes.data not null -> response is nonempty (access token valid)
                // graphRes.data[0] not null -> users are friends
                var id = graphRes.data[0].id;
                Friends[followerID].add(id);
                next(runnerAsJSON(id));
            } else {
                //they must not be friends
                next("ERROR::Get non-friend or nonexistent user "
                    + JSON.stringify(graphRes));
            }
        });
    }
}

var runnerAsJSON = function(id) {
    var raw = Runner[id];
    if (!raw) {
        return "ERROR::DBMS attempt to access user with no defined location"
    } else {
        var res = {"RunnerID": id, 
          "Latitude": raw.Latitude,
          "Longitude": raw.Longitude,
          "Timestamp": raw.Timestamp
        }
        return res;
    }
}

//MARK: Request parameter validation
//Token has no spaces, id/lat/long/ts are numeric
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

//MARK: Caching functions
var checkTokenCache = function(token) {
    if (TokenCache[token]) {
        var now = new Date().getTime();
        if (now > TokenCache[token].expiry) {
            return undefined; //expired cached token
        } else {
            return TokenCache[token].ID; //good cached token
        }
    } else {
        return undefined; //token not in cache
    }
}

var validateWithFacebook = function(token, next) {
    //Check with FBGRAPH to determine token validity
    var graph = require('fbgraph');
    graph.get("debug_token?input_token=" + token
      + "&access_token=" + constants.facebookAuth.clientID 
      + "|" + constants.facebookAuth.clientSecret, function(fberr, res) {
        if (fberr) {
            // console.log("ERROR::FBERROR " + JSON.stringify(fberr) );
            next(undefined);
        } else if (res.data.error) {
            // console.log("ERROR::FBERROR " + res.data.error.message );
            next(undefined);
        } else {
            var tokenId = res.data.user_id;
            var expiry = res.data.expires_at;
            TokenCache[token] = {ID: tokenId, Expiry: expiry};
            next(tokenId);
        }
    });
}
