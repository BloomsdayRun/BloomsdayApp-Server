/*
A very simple server to log and display location data.
*/

// Set the environment flag to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var uri = 'mongodb://localhost:27017/runnerdata';

//Mongoose is a system for enforcing a schema structure on MongoDB
// Hence we interact with MongoDB by way of Mongoose
var mongoose = require('mongoose');
mongoose.connect(uri);

//Create a schema for runners
// TODO: Refactor schema to accurately reflect ENSC's data types
var RunnerSchema = new mongoose.Schema({
    name: String,
    location: String,
    time: Number
});
// A model is a constructor compiled from the schema definition
mongoose.model('Runner', RunnerSchema);

var Runner = mongoose.model('Runner');

// In Express, the CRUD callbacks are functions of request, response, and next
// TODO: Update rather than create for names that already exist
create = function(req, res, next) {
    console.log("Called create. Received the following JSON: ");
    console.log(req.body);
    var entry = new Runner(req.body);

    //Saving the database entry; use anonymous function to process errors
    entry.save(function(err) {
        // TODO: We can change these to meaningful error messages per ENSC's requests
        if (err) {
            console.log("Had an error");
            res.send("Had an error");
            return next(err);
        } else {
            console.log("Great success!");
            res.send("Great Success");
            //This line was in a tutorial, but causes "topology was destroyed" error
            // I think it's supposed to return the JSON as a response
            // res.json(runner);
        }
    });
};

//Show all the data in the database
// TODO: Throttle output to first N entries when database becomes larger
list = function(req, res, next) {
    console.log("Servin' up data!");
    Runner.find({}, function(err, runners) {
        if (err) {
            return next(err);
        } else {
            res.json(runners);
        }
    });
};


//Set up the server; the port number is arbitrary
var port = 9000;
var express = require('express');
var app = express();

//Use this library to make the Express server parse raw JSON
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Defines the server's listeners: call create on post request; list on get request
app.route('/').post(create).get(list);
app.listen(port);

console.log(process.env.NODE_ENV  + ' server running at http://localhost:' + port);

