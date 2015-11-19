//TODO: Authenticate connection with SSL

//Ensure you are running a MySQL server on localhost
var mysql      = require('mysql');
//NOTE: When deploying, don't push actual usernames/passwords to public repo
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'bloomsday',
    password : 'bloomsday',
    database : 'bloomsday'
});
connection.connect();

//Dependencies
var express = require( 'express' );
    bodyParser = require('body-parser');

//app is the express server
var app = express();

//Parses the body of HTTP requests (may not be needed)
app.use(bodyParser.urlencoded({
    extended: true
}));

//Route different requests to different dbms actions
// TODO: Good form would be to put router code in a separate JS file
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

//Start server
var port = 8080;
app.listen( port, function() {
    console.log(app.settings.env, "server running at http://localhost:", port);
});

//End mysql connection
// TODO: Is it okay to leave MySQL connection open for duration of server lifetime?
// connection.end();
