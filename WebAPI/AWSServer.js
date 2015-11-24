//TODO: Authenticate connection with SSL

//MARK: Dependencies
//RESTful API
var express  = require( 'express' );
var app      = express();
var mysql    = require('mysql');
var path     = require('path'); //required for unit tests

//Auth
var bodyParser = require('body-parser'); //parse HTTP responses
var port       = process.env.PORT || 8080;
var passport   = require('passport'); //authentication middleware
var flash      = require('connect-flash'); //flash messages
var morgan       = require('morgan'); //post/get messages -> console
var cookieParser = require('cookie-parser'); //read cookies
var session      = require('express-session');

// MARK: Config DBMS & auth
// TODO: You may want to refactor DBMS code into separate file
//Ensure you are running a MySQL server on localhost
//NOTE: When deploying, don't push actual usernames/passwords to public repo
var constants = require('./config/constants.js');
var connection = mysql.createConnection({
    host     : constants.MySQL.host,
    user     : constants.MySQL.user,
    password : constants.MySQL.password,
    database : constants.MySQL.database
});
connection.connect();

//EJS allows embedded Javascript in pages
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(morgan('dev'));

//Parses the body of HTTP requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

//Configure passport
require('./config/passport')(passport); // pass passport for configuration
//I don't believe we'll use sessions in RESTful API (stateless)...
//TODO: Refactor per final design
app.use(session({ secret: "THIS IS THE SESSION SECRET" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes take passport for auth and connection to talk to DBMS
require('./app/routes.js')(app, passport, connection); 

//Start server
var server = app.listen( port, function() {
    console.log(app.settings.env, "server running at http://localhost:", port);
});

//Export server so mocha tests work
module.exports = server;

//End mysql connection
// TODO: Is it okay to leave MySQL connection open for duration of server lifetime?
// connection.end();
