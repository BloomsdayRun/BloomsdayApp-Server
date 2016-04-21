// Dependencies
var express  = require( 'express' );
var app      = express();
var path     = require('path'); //required for unit tests
var bodyParser = require('body-parser'); //parse HTTP responses
var port       = process.env.PORT || 8080;
var morgan     = require('morgan'); //post/get messages -> console

// MARK: Config & auth
//EJS allows embedded Javascript in pages
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(morgan('dev')); //uncomment to log requests

//Parses the body of HTTP requests
app.use(bodyParser.urlencoded({
    extended: true
}));

require('./app/routes.js')(app); 

//Start server
var server = app.listen( port, function() {
    console.log(app.settings.env, "server running at http://localhost:", port);
});

//Export server so mocha tests work
module.exports = server;
