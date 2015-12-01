//Return a connection to MySQL server
//Ensure you are running a MySQL server on localhost
//NOTE: When deploying, don't push actual usernames/passwords to public repo
var mysql    = require('mysql');
var constants = require('./constants.js');

//TODO: Config number of connections based on demand
var connection = mysql.createPool({
    host     : constants.MySQL.host,
    user     : constants.MySQL.user,
    password : constants.MySQL.password,
    database : constants.MySQL.database	
})

module.exports = connection;
