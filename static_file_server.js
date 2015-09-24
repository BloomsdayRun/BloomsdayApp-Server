// Set app to be an express server
var express = require("express"),
    app = express();

// Specifically, a static file server with contents found in public
app.use(express.static(__dirname + "/public"));

//Set your browser to http://localhost:8080/FILE_TO_BROWSE
app.listen(8080);
console.log("Static file server on port 8080");
