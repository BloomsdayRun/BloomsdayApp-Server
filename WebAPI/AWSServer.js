//TODO: Authenticate connection with SSL

//MARK: Dependencies
//RESTful API
var express  = require( 'express' );
var app      = express();
var path     = require('path'); //required for unit tests

//Auth
var bodyParser = require('body-parser'); //parse HTTP responses
var port       = process.env.PORT || 8080;
var flash      = require('connect-flash'); //flash messages
var morgan     = require('morgan'); //post/get messages -> console

// MARK: Config & auth
//EJS allows embedded Javascript in pages
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(morgan('dev'));

//Parses the body of HTTP requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(flash());

// Routes take passport for auth and connection to talk to DBMS
require('./app/routes.js')(app); 

//Start server
var server = app.listen( port, function() {
    console.log(app.settings.env, "server running at http://localhost:", port);
});

//Export server so mocha tests work
module.exports = server;
